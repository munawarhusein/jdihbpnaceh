import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KategoriService } from './kategori.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Kategori')
@Controller('kategori')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Post()
  @Roles('admin', 'pengelola')
  @ApiOperation({ summary: 'Menambahkan kategori hukum baru' })
  @ApiResponse({ status: 201, description: 'Berhasil membuat kategori.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKategoriDto: CreateKategoriDto) {
    return this.kategoriService.create(createKategoriDto);
  }

  @Get()
  @Roles('admin', 'pengelola', 'publik')
  @ApiOperation({ summary: 'Mengambil semua kategori yang ada' })
  findAll() {
    return this.kategoriService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'pengelola', 'publik')
  @ApiOperation({ summary: 'Mendapat spesifik kategori' })
  findOne(@Param('id') id: string) {
    return this.kategoriService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'pengelola')
  @ApiOperation({ summary: 'Pembaruan data (Ubah Nama / Aktifasi) kategori' })
  update(@Param('id') id: string, @Body() updateKategoriDto: UpdateKategoriDto) {
    return this.kategoriService.update(id, updateKategoriDto);
  }

  @Delete(':id')
  @Roles('admin') // Hanya admin murni yang bisa delete kategori hard delete
  @ApiOperation({ summary: 'Hapustuntas kategori' })
  remove(@Param('id') id: string) {
    return this.kategoriService.remove(id);
  }
}
