import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El tipo es requerido (estacion, almacen, bodega)' })
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
