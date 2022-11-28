import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SuscripcionEntity } from './entity/suscripcion.entity';
import { SuscripcionesService } from './suscripciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('SuscripcionesService', () => {
  let service: SuscripcionesService;
  let suscripcionesRepository: Repository<SuscripcionEntity>;
  let suscripcion: SuscripcionEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SuscripcionesService],
    }).compile();

    service = module.get<SuscripcionesService>(SuscripcionesService);
    suscripcionesRepository = module.get<Repository<SuscripcionEntity>>(
      getRepositoryToken(SuscripcionEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    suscripcionesRepository.clear();
    suscripcion = await suscripcionesRepository.save({
      idDeportista: 1,
      idTipoSuscripcion: faker.datatype.number(),
      idNivel: faker.datatype.number(),
      complementos: faker.datatype.number(),
      idMedioPago: faker.datatype.number(),
    });
  };

  it('El servicio de suscripciones debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findByDeportistaId debe retornar los datos de la suscripción a partir de un id de deportista suministrado', async () => {
    const suscripcionAlmacenada: SuscripcionEntity =
      await service.findByDeportistaId(suscripcion.idDeportista);
    expect(suscripcionAlmacenada).not.toBeNull();
    expect(suscripcionAlmacenada.idTipoSuscripcion).toEqual(
      suscripcion.idTipoSuscripcion,
    );
    expect(suscripcionAlmacenada.idNivel).toEqual(suscripcion.idNivel);
    expect(suscripcionAlmacenada.complementos).toEqual(
      suscripcion.complementos,
    );
    expect(suscripcionAlmacenada.idMedioPago).toEqual(suscripcion.idMedioPago);
  });

  it('findByDeportistaId debe lanzar una excepción para un id de un deportista que no tenga una suscripción', async () => {
    await expect(() => service.findByDeportistaId(0)).rejects.toHaveProperty(
      'message',
      'No se encontró una suscripción para el id de deportista suministrado',
    );
  });

  it('create debe almacenar una nueva suscripción para un deportista', async () => {
    let suscripcionNueva: SuscripcionEntity = {
      id: -1,
      idDeportista: 2,
      idTipoSuscripcion: faker.datatype.number(),
      idNivel: faker.datatype.number(),
      complementos: faker.datatype.number(),
      idMedioPago: faker.datatype.number(),
    };

    suscripcionNueva = await service.create(suscripcionNueva);
    expect(suscripcionNueva).not.toBeNull();
    const suscripcionAlmacenada: SuscripcionEntity =
      await service.findByDeportistaId(suscripcionNueva.idDeportista);
    expect(suscripcionAlmacenada).not.toBeNull();
    expect(suscripcionAlmacenada.idTipoSuscripcion).toEqual(
      suscripcionNueva.idTipoSuscripcion,
    );
    expect(suscripcionAlmacenada.idNivel).toEqual(suscripcionNueva.idNivel);
    expect(suscripcionAlmacenada.complementos).toEqual(
      suscripcionNueva.complementos,
    );
    expect(suscripcionAlmacenada.idMedioPago).toEqual(
      suscripcionNueva.idMedioPago,
    );
  });

  it('create debe lanzar una excepción para un id de deportista que ya tenga una suscripción', async () => {
    const suscripcionNueva: SuscripcionEntity = {
      id: -1,
      idDeportista: 1,
      idTipoSuscripcion: faker.datatype.number(),
      idNivel: faker.datatype.number(),
      complementos: faker.datatype.number(),
      idMedioPago: faker.datatype.number(),
    };
    await expect(() => service.create(suscripcionNueva)).rejects.toHaveProperty(
      'message',
      `Ya existe una suscripción asociada al id ${suscripcionNueva.idDeportista}`,
    );
  });

  it('update debe modificar los datos de una suscripción', async () => {
    suscripcion.idTipoSuscripcion = faker.datatype.number();
    suscripcion.idNivel = faker.datatype.number();
    const suscripcionActualizada = await service.update(
      suscripcion.idDeportista,
      suscripcion,
    );
    expect(suscripcionActualizada).not.toBeNull();
    const suscripcionAlmacenada: SuscripcionEntity =
      await service.findByDeportistaId(suscripcion.idDeportista);
    expect(suscripcionAlmacenada).not.toBeNull();
    expect(suscripcionAlmacenada.idTipoSuscripcion).toEqual(
      suscripcion.idTipoSuscripcion,
    );
    expect(suscripcionAlmacenada.idNivel).toEqual(suscripcion.idNivel);
    expect(suscripcionAlmacenada.complementos).toEqual(
      suscripcion.complementos,
    );
    expect(suscripcionAlmacenada.idMedioPago).toEqual(suscripcion.idMedioPago);
  });

  it('update debe lanzar una excepción para un id de deportista que no tiene una suscripción registrada y se está intentando actualizar', async () => {
    suscripcion.idTipoSuscripcion = faker.datatype.number();
    suscripcion.idNivel = faker.datatype.number();
    await expect(() => service.update(-1, suscripcion)).rejects.toHaveProperty(
      'message',
      'No se encontró una suscripción para el id de deportista suministrado',
    );
  });

  it('delete debe eliminar los datos de una suscripción', async () => {
    await service.delete(suscripcion.idDeportista);
    await expect(() =>
      service.findByDeportistaId(suscripcion.idDeportista),
    ).rejects.toHaveProperty(
      'message',
      'No se encontró una suscripción para el id de deportista suministrado',
    );
  });

  it('delete debe lanzar una excepción para un id de deportista que no tiene una suscripción registrada y se está intentando eliminar', async () => {
    await expect(() => service.delete(-1)).rejects.toHaveProperty(
      'message',
      'No se encontró una suscripción para el id de deportista suministrado',
    );
  });
});
