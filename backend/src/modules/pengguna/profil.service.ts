import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfilService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfil(userId: string) {
    const user = await this.prisma.pengguna.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        jabatan: true,
        nip: true,
        unit_kerja: true,
        no_telepon: true,
        foto_url: true,
      },
    });

    if (!user) throw new NotFoundException('Pengguna tidak ditemukan.');
    return user;
  }

  async updateProfil(userId: string, data: any) {
    // Hanya membolehkan update field tertentu
    const { nama, jabatan, nip, unit_kerja, no_telepon } = data;

    const updated = await this.prisma.pengguna.update({
      where: { id: userId },
      data: {
        ...(nama && { nama }),
        ...(jabatan && { jabatan }),
        ...(nip && { nip }),
        ...(unit_kerja && { unit_kerja }),
        ...(no_telepon && { no_telepon }),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        jabatan: true,
        nip: true,
        unit_kerja: true,
        no_telepon: true,
        foto_url: true,
      },
    });

    return updated;
  }
}
