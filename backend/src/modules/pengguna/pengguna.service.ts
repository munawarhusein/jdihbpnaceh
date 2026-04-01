import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePenggunaDto } from './dto/create-pengguna.dto';
import { UpdatePenggunaDto } from './dto/update-pengguna.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PenggunaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePenggunaDto) {
    const isExist = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
    });
    if (isExist) throw new ConflictException(`Email '${dto.email}' sudah terdaftar.`);

    const salt = await bcrypt.genSalt(10);
    const hashData = await bcrypt.hash(dto.kata_sandi, salt);

    const newUser = await this.prisma.pengguna.create({
      data: {
        nama: dto.nama,
        email: dto.email,
        kata_sandi: hashData,
        peran: dto.peran || 'pengelola',
        aktif: dto.aktif !== undefined ? dto.aktif : true,
      },
    });

    const { kata_sandi, ...result } = newUser;
    return result;
  }

  async findAll() {
    const pengguna = await this.prisma.pengguna.findMany({
      orderBy: { dibuat_pada: 'desc' },
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        aktif: true,
        terakhir_masuk: true,
        dibuat_pada: true,
      }
    });
    return pengguna;
  }

  async findOne(id: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { id },
      select: { id: true, nama: true, email: true, peran: true, aktif: true }
    });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan.');
    return user;
  }

  async update(id: string, dto: UpdatePenggunaDto) {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const isExist = await this.prisma.pengguna.findUnique({ where: { email: dto.email } });
      if (isExist) throw new ConflictException(`Email '${dto.email}' sudah dipakai pengguna lain.`);
    }

    let passwordHash = undefined;
    if (dto.kata_sandi) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(dto.kata_sandi, salt);
    }

    const { kata_sandi: tempSandi, ...safeDto } = dto;
    
    const updatedUser = await this.prisma.pengguna.update({
      where: { id },
      data: {
        ...safeDto,
        ...(passwordHash ? { kata_sandi: passwordHash } : {}),
      },
      select: { id: true, nama: true, email: true, peran: true, aktif: true }
    });

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pengguna.delete({ where: { id } });
  }
}
