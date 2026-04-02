import {
  IsString, IsNotEmpty, IsInt, IsOptional, IsArray,
  Min, MaxLength, IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { StatusDokumen } from '@prisma/client';

export class BuatDokumenDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul wajib diisi' })
  @MaxLength(500)
  judul: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nomor?: string;

  @IsInt()
  @Min(1945, { message: 'Tahun tidak valid' })
  @Type(() => Number)
  tahun: number;

  @IsString()
  @IsNotEmpty({ message: 'Jenis wajib diisi' })
  @MaxLength(100)
  jenis: string;

  @IsString()
  @IsNotEmpty({ message: 'Instansi wajib diisi' })
  @MaxLength(255)
  instansi: string;

  @IsString()
  @IsOptional()
  abstrak?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map((v: string) => v.trim());
    return value;
  })
  kata_kunci?: string[];

  @IsArray()
  @IsOptional()
  kategori_ids?: string[];

  @IsString()
  @IsOptional()
  @IsEnum(StatusDokumen)
  status?: StatusDokumen;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  sifat_sensitif?: boolean;

  @IsString()
  @IsOptional()
  nip_pemilik?: string;
}
