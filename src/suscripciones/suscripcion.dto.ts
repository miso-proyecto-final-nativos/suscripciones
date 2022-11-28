import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class SuscripcionDto {
  @IsNumber()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  idDeportista: number;

  @IsNumber()
  @IsNotEmpty()
  idTipoSuscripcion: any;

  @IsNumber()
  @IsNotEmpty()
  idNivel: number;

  @IsArray()
  complementos?: number[];

  @IsNumber()
  @IsNotEmpty()
  idMedioPago: number;
}
