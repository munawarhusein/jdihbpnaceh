import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PenggunaService } from './pengguna.service';
import { CreatePenggunaDto } from './dto/create-pengguna.dto';
import { UpdatePenggunaDto } from './dto/update-pengguna.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Pengguna')
@Controller('pengguna')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PenggunaController {
  constructor(private readonly penggunaService: PenggunaService) {}

  @Post()
  @Roles('admin') // Hanya Super Admin yang bisa menambah akun
  @ApiOperation({ summary: 'Menambahkan akun manajer JDIH' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPenggunaDto: CreatePenggunaDto) {
    return this.penggunaService.create(createPenggunaDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Mendapat daftar admin/pengelola' })
  findAll() {
    return this.penggunaService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.penggunaService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updatePenggunaDto: UpdatePenggunaDto) {
    return this.penggunaService.update(id, updatePenggunaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.penggunaService.remove(id);
  }
}
