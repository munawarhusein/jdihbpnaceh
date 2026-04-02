import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DeepseekService {
  private readonly logger = new Logger(DeepseekService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  }

  async generateAbstrak(teksDokumen: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY tidak dikonfigurasi. Lewati auto-abstrak.');
      return null;
    }

    if (!teksDokumen || teksDokumen.length < 100) {
      this.logger.debug('Teks terlalu pendek untuk di-generate abstraknya');
      return null;
    }

    // Ambil maksimal 8000 karakter pertama agar request tidak terlalu besar
    const teksSample = teksDokumen.substring(0, 8000);

    try {
      this.logger.log('Memanggil API DeepSeek untuk generate abstrak...');
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah asisten legal yang ahli dalam merangkum peraturan perundang-undangan dan pedoman standar Kementerian Agraria dan Tata Ruang/Badan Pertanahan Nasional. Buat abstrak atau ringkasan dalam 1 paragraf singkat (maksimal 4-5 kalimat) dari teks berikut.'
            },
            {
              role: 'user',
              content: `Buat rincian abstrak untuk dokumen hukum berikut ini:\n\n${teksSample}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 20000, // Timeout 20 detik
        }
      );

      const abstrak = response.data?.choices?.[0]?.message?.content;
      if (abstrak) {
        return abstrak.trim();
      }
      return null;
    } catch (error: any) {
      this.logger.error(`Gagal generate abstrak dari DeepSeek: ${error.message}`);
      return null;
    }
  }

  async generateTags(teksDokumen: string): Promise<string[]> {
    if (!this.apiKey) return [];
    
    // Potong 5000 chars pertama untuk mempercepat
    const teksSample = teksDokumen.substring(0, 5000);

    try {
      this.logger.log('Memanggil API DeepSeek untuk auto-tagging...');
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah asisten legal BPN. Ekstrak 3-5 subjek/kata kunci PENTING dan spesifik dari dokumen, pisahkan dengan KOMA saja. Jangan pakai nomor.'
            },
            {
              role: 'user',
              content: `Teks dokumen:\n${teksSample}`
            }
          ],
          temperature: 0.2,
          max_tokens: 50,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        }
      );

      const resText = response.data?.choices?.[0]?.message?.content;
      if (resText) {
        return resText.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      return [];
    } catch (error: any) {
      this.logger.error(`Gagal auto-tagging dari DeepSeek: ${error.message}`);
      return [];
    }
  }
}
