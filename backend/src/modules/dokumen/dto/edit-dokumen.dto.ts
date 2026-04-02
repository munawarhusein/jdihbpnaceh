import { IsString, IsOptional, IsInt, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StatusDokumen } from '@prisma/client';

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

  @IsOptional()
  @IsEnum(StatusDokumen)
  status?: StatusDokumen;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  sifat_sensitif?: boolean;

  @IsOptional()
  @IsString()
  nip_pemilik?: string;
}
