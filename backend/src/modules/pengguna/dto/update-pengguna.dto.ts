import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePenggunaDto } from './create-pengguna.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePenggunaDto extends PartialType(CreatePenggunaDto) {
  // Kata sandi bisa dikosongkan jika update nama saja
  @ApiPropertyOptional({ description: 'Isi hanya jika ingin ganti password' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  kata_sandi?: string;
}
