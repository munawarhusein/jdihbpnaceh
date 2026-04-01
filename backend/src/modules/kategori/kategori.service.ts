import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';

@Injectable()
export class KategoriService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKategoriDto) {
    const isExist = await this.prisma.kategori.findUnique({
      where: { nama: dto.nama },
    });
    if (isExist) throw new ConflictException(`Kategori '${dto.nama}' sudah ada di database.`);

    return this.prisma.kategori.create({
      data: {
        nama: dto.nama,
        keterangan: dto.keterangan,
        aktif: dto.aktif !== undefined ? dto.aktif : true,
      },
    });
  }

  async findAll() {
    return this.prisma.kategori.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: string) {
    const kat = await this.prisma.kategori.findUnique({ where: { id } });
    if (!kat) throw new NotFoundException('Kategori tidak ditemukan.');
    return kat;
  }

  async update(id: string, dto: UpdateKategoriDto) {
    await this.findOne(id); // memastikan ada
    if (dto.nama) {
      const isExist = await this.prisma.kategori.findFirst({
        where: { nama: dto.nama, NOT: { id } },
      });
      if (isExist) throw new ConflictException(`Kategori '${dto.nama}' sudah dipakai.`);
    }

    return this.prisma.kategori.update({
      where: { id },
      data: {
        nama: dto.nama,
        keterangan: dto.keterangan,
        aktif: dto.aktif,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.kategori.delete({ where: { id } });
  }
}
