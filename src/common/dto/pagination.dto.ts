import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class PaginationDto {
  @IsNumber({ }, { message: 'El page debe ser un número' })
  @IsOptional()
  //? Convertir a número con class-transformer
  @Type(() => Number)
  page?: number = 1;

  @IsNumber({ }, { message: 'El limit debe ser un número' })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}