import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterDokumenDto {
  @IsOptional()
  @IsString()
  q?: string; // kata kunci pencarian

  @IsOptional()
  @IsString()
  jenis?: string;

  @IsOptional()
  @IsString()
  instansi?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tahun?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  halaman?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['relevansi', 'terbaru', 'terlama'])
  urutkan?: 'relevansi' | 'terbaru' | 'terlama' = 'terbaru';
}
