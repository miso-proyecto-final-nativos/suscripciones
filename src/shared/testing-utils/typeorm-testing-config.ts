import { TypeOrmModule } from '@nestjs/typeorm';
import { SuscripcionEntity } from '../../suscripciones/entity/suscripcion.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [SuscripcionEntity],
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature([SuscripcionEntity]),
];
