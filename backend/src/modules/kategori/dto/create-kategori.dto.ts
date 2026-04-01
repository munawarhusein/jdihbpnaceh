import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKategoriDto {
  @ApiProperty({ description: 'Nama unik kategori dokumen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nama: string;

  @ApiPropertyOptional({ description: 'Penjelasan kategori' })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiPropertyOptional({ description: 'Status keaktifan kategori', default: true })
  @IsBoolean()
  @IsOptional()
  aktif?: boolean;
}
