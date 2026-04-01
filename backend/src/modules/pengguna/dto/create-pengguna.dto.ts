import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeranPengguna } from '@prisma/client';

export class CreatePenggunaDto {
  @ApiProperty({ description: 'Nama Lengkap pengguna' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nama: string;

  @ApiProperty({ description: 'Email korporat BPN' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: 'Kata Sandi untuk masuk' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  kata_sandi: string;

  @ApiPropertyOptional({ enum: PeranPengguna, description: 'Peran akses', default: PeranPengguna.pengelola })
  @IsEnum(PeranPengguna)
  @IsOptional()
  peran?: PeranPengguna;

  @ApiPropertyOptional({ description: 'Status aktif', default: true })
  @IsBoolean()
  @IsOptional()
  aktif?: boolean;
}
