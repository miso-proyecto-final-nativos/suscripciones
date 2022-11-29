import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SuscripcionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  idDeportista: number;

  @Column()
  idTipoSuscripcion: number;

  @Column()
  idNivel: number;

  @Column({ array: true })
  complementos?: number;

  @Column()
  idMedioPago: number;
}
