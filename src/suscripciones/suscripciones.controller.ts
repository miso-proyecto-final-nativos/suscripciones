import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  RequestTimeoutException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { plainToInstance } from 'class-transformer';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import {
  BusinessError,
  BusinessLogicException,
} from 'src/shared/errors/business-errors';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { SuscripcionEntity } from './entity/suscripcion.entity';
import { AuthGuard } from './guards/auth.guard';
import { SuscripcionDto } from './suscripcion.dto';
import { SuscripcionesService } from './suscripciones.service';

@Controller('suscripciones')
@UseInterceptors(BusinessErrorsInterceptor)
export class SuscripcionesController {
  constructor(
    @Inject('MS_CATALOGO_SERVICE') private clienteCatalogoService: ClientProxy,
    @Inject('USER_MS') private clienteUsuarioService: ClientProxy,
    private readonly suscripcionesService: SuscripcionesService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  async healthCheck() {
    return this.health.check([async () => this.db.pingCheck('database')]);
  }

  @UseGuards(AuthGuard)
  @Get(':idDeportista')
  async findByDeportistaId(@Param('idDeportista') idDeportista: number) {
    return await this.suscripcionesService.findByDeportistaId(idDeportista);
  }

  @UseGuards(AuthGuard)
  @Post(':idDeportista')
  async create(
    @Param('idDeportista') idDeportista: number,
    @Body() suscripcionDto: SuscripcionDto,
  ) {
    await this.validarIdDeportista(idDeportista);
    await this.validarTipoSuscripcion(suscripcionDto.idTipoSuscripcion);
    await this.validarNivel(suscripcionDto.idNivel);
    const idComplementoPlanNoValido = await this.validarComplementos(
      suscripcionDto.complementos,
    );
    if (idComplementoPlanNoValido) {
      throw new BusinessLogicException(
        `No se encontró el complemento con el id ${idComplementoPlanNoValido}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
    await this.validarMedioPago(suscripcionDto.idMedioPago);
    suscripcionDto.idDeportista = idDeportista;
    const suscripcionEntity: SuscripcionEntity = plainToInstance(
      SuscripcionEntity,
      suscripcionDto,
    );
    return await this.suscripcionesService.create(suscripcionEntity);
  }

  private async validarIdDeportista(idDeportista: number) {
    const deportista$ = this.clienteUsuarioService
      .send({ role: 'user', cmd: 'getById' }, { idDeportista })
      .pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      );

    const deportista = await firstValueFrom(deportista$);

    if (!deportista) {
      throw new BusinessLogicException(
        `No se encontró un deportista con el id ${idDeportista}`,
        BusinessError.NOT_FOUND,
      );
    }
  }

  private async validarTipoSuscripcion(idTipoSuscripcion: number) {
    const tipoSuscripcion$ = this.clienteCatalogoService
      .send(
        { role: 'suscripcion', cmd: 'getById' },
        { suscripcionId: idTipoSuscripcion },
      )
      .pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      );

    const tipoSuscripcion = await firstValueFrom(tipoSuscripcion$);

    if (!tipoSuscripcion) {
      throw new BusinessLogicException(
        `No se encontró un tipo de suscripción con el id ${idTipoSuscripcion}`,
        BusinessError.NOT_FOUND,
      );
    }
  }

  private async validarNivel(idNivel: number) {
    const nivelPlan$ = this.clienteCatalogoService
      .send({ role: 'nivelPlan', cmd: 'getById' }, { nivelPlanId: idNivel })
      .pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      );

    const nivelPlan = await firstValueFrom(nivelPlan$);

    if (!nivelPlan) {
      throw new BusinessLogicException(
        `No se encontró un nivel de plan con el id ${idNivel}`,
        BusinessError.NOT_FOUND,
      );
    }
  }

  private async validarComplementos(complementos: number[]) {
    let idComplementoNoValido = undefined;
    for (let i = 0; i < complementos.length; i++) {
      try {
        const complementoPlanId = complementos[i];
        const complemento$ = this.clienteCatalogoService
          .send(
            { role: 'complementoPlan', cmd: 'getById' },
            { idComplementoPlan: complementoPlanId },
          )
          .pipe(
            timeout(5000),
            catchError((err) => {
              if (err instanceof TimeoutError) {
                return throwError(() => new RequestTimeoutException());
              }
              return throwError(() => err);
            }),
          );

        const complemento = await firstValueFrom(complemento$);

        if (!complemento) {
          throw new BusinessLogicException(
            `No se encontró el complemento con el id ${complementoPlanId}`,
            BusinessError.NOT_FOUND,
          );
        }
      } catch (error) {
        idComplementoNoValido = complementos[i];
        break;
      }
    }
    return idComplementoNoValido;
  }

  private async validarMedioPago(idMedioPago: number) {
    const medioPago$ = this.clienteCatalogoService
      .send({ role: 'medioPago', cmd: 'getById' }, { idMedioPago: idMedioPago })
      .pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      );

    const medioPago = await firstValueFrom(medioPago$);

    if (!medioPago) {
      throw new BusinessLogicException(
        `No se encontró un medio de pago con el id ${idMedioPago}`,
        BusinessError.NOT_FOUND,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put(':idDeportista')
  async update(
    @Param('idDeportista') idDeportista: number,
    @Body() suscripcionDto: SuscripcionDto,
  ) {
    await this.validarIdDeportista(idDeportista);
    await this.validarTipoSuscripcion(suscripcionDto.idTipoSuscripcion);
    await this.validarNivel(suscripcionDto.idNivel);
    const idComplementoPlanNoValido = await this.validarComplementos(
      suscripcionDto.complementos,
    );
    if (idComplementoPlanNoValido) {
      throw new BusinessLogicException(
        `No se encontró el complemento con el id ${idComplementoPlanNoValido}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
    await this.validarMedioPago(suscripcionDto.idMedioPago);
    suscripcionDto.idDeportista = idDeportista;
    const perfilDeportivoEntity: SuscripcionEntity = plainToInstance(
      SuscripcionEntity,
      suscripcionDto,
    );
    return await this.suscripcionesService.update(
      idDeportista,
      perfilDeportivoEntity,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':idDeportista')
  @HttpCode(204)
  async delete(@Param('idDeportista') idDeportista: number) {
    return await this.suscripcionesService.delete(idDeportista);
  }
}
