import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class EditDokumenDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsString()
  nomor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tahun?: number;

  @IsOptional()
  @IsString()
  jenis?: string;

  @IsOptional()
  @IsString()
  instansi?: string;

  @IsOptional()
  @IsString()
  abstrak?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kata_kunci?: string[];
}
