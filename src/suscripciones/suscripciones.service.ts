import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SuscripcionEntity } from './entity/suscripcion.entity';

@Injectable()
export class SuscripcionesService {
  constructor(
    @InjectRepository(SuscripcionEntity)
    private readonly suscripcionRepository: Repository<SuscripcionEntity>,
  ) {}

  async findByDeportistaId(idDeportista: number): Promise<SuscripcionEntity> {
    const suscripcion: SuscripcionEntity = await this.validarSuscripcion(
      idDeportista,
    );
    return suscripcion;
  }

  private async validarSuscripcion(idDeportista: number) {
    const suscripcion: SuscripcionEntity =
      await this.suscripcionRepository.findOne({
        where: { idDeportista: idDeportista },
      });
    if (!suscripcion)
      throw new BusinessLogicException(
        'No se encontró una suscripción para el id de deportista suministrado',
        BusinessError.NOT_FOUND,
      );
    return suscripcion;
  }

  async create(suscripcion: SuscripcionEntity): Promise<SuscripcionEntity> {
    await this.validarIdDeportista(suscripcion.idDeportista);
    return await this.suscripcionRepository.save(suscripcion);
  }

  private async validarIdDeportista(idDeportista: number) {
    const suscripcion: SuscripcionEntity =
      await this.suscripcionRepository.findOne({
        where: { idDeportista: idDeportista },
      });
    if (suscripcion)
      throw new BusinessLogicException(
        `Ya existe una suscripción asociada al id ${suscripcion.idDeportista}`,
        BusinessError.PRECONDITION_FAILED,
      );
  }

  async update(
    idDeportista: number,
    suscripcion: SuscripcionEntity,
  ): Promise<SuscripcionEntity> {
    const persistedSuscripcion: SuscripcionEntity =
      await this.validarSuscripcion(idDeportista);
    return await this.suscripcionRepository.save({
      ...persistedSuscripcion,
      ...suscripcion,
    });
  }

  async delete(idDeportista: number) {
    const suscripcion: SuscripcionEntity = await this.validarSuscripcion(
      idDeportista,
    );
    await this.suscripcionRepository.delete(suscripcion);
  }
}
