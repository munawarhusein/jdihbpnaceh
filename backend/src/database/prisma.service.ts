import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database terhubung');

    // Log query lambat di development
    if (process.env.NODE_ENV === 'development') {
      (this.$on as any)('query', (e: any) => {
        if (e.duration > 1000) {
          this.logger.warn(`Query lambat (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database terputus');
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase tidak boleh dijalankan di production!');
    }
    // Urutan penting karena ada foreign key constraints
    await this.logAktivitas.deleteMany();
    await this.relasiDokumen.deleteMany();
    await this.dokumenKategori.deleteMany();
    await this.dokumen.deleteMany();
    await this.kategori.deleteMany();
    await this.pengguna.deleteMany();
  }
}
