import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, kata_sandi } = loginDto;

    // Cari pengguna berdasarkan email
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { email, aktif: true, dihapus_pada: null },
    });

    if (!pengguna) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    // Verifikasi kata sandi
    const isPasswordValid = await bcrypt.compare(kata_sandi, pengguna.kata_sandi);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }

    // Generate tokens
    const payload = { sub: pengguna.id, email: pengguna.email, peran: pengguna.peran };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    // Update terakhir_masuk & catat log
    await this.prisma.$transaction([
      this.prisma.pengguna.update({
        where: { id: pengguna.id },
        data: { terakhir_masuk: new Date() },
      }),
      this.prisma.logAktivitas.create({
        data: {
          pengguna_id: pengguna.id,
          tipe_aksi: 'login',
          keterangan: 'Login berhasil',
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      }),
    ]);

    this.logger.log(`Pengguna ${pengguna.email} berhasil login`);

    return {
      akses_token: accessToken,
      refresh_token: refreshToken,
      pengguna: {
        id: pengguna.id,
        nama: pengguna.nama,
        email: pengguna.email,
        peran: pengguna.peran,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const pengguna = await this.prisma.pengguna.findFirst({
        where: { id: payload.sub, aktif: true, dihapus_pada: null },
      });

      if (!pengguna) throw new UnauthorizedException();

      const newPayload = { sub: pengguna.id, email: pengguna.email, peran: pengguna.peran };
      const accessToken = this.jwtService.sign(newPayload);

      return { akses_token: accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kadaluarsa');
    }
  }

  async validateUser(payload: any) {
    return this.prisma.pengguna.findFirst({
      where: { id: payload.sub, aktif: true, dihapus_pada: null },
      select: { id: true, nama: true, email: true, peran: true },
    });
  }
}
