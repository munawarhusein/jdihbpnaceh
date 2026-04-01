import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

// Mapping index untuk dokumen JDIH dengan analisis Bahasa Indonesia
const DOKUMEN_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        indonesia_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'indonesia_stop'],
        },
        judul_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
      filter: {
        indonesia_stop: {
          type: 'stop',
          stopwords: [
            'yang', 'dan', 'di', 'ke', 'dari', 'dengan', 'untuk', 'adalah',
            'ini', 'itu', 'atau', 'juga', 'akan', 'ada', 'tidak', 'pada',
            'dalam', 'oleh', 'sebagai', 'tersebut', 'telah', 'bahwa',
          ],
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      judul: {
        type: 'text',
        analyzer: 'judul_analyzer',
        fields: {
          keyword: { type: 'keyword', normalizer: 'lowercase' },
          suggest: {
            type: 'completion',
            analyzer: 'judul_analyzer',
          },
        },
      },
      nomor: { type: 'keyword' },
      tahun: { type: 'integer' },
      jenis: { type: 'keyword' },
      instansi: {
        type: 'text',
        analyzer: 'judul_analyzer',
        fields: { keyword: { type: 'keyword' } },
      },
      status: { type: 'keyword' },
      isi_teks: {
        type: 'text',
        analyzer: 'indonesia_analyzer',
        term_vector: 'with_positions_offsets', // untuk highlight
      },
      kata_kunci: { type: 'keyword' },
      abstrak: { type: 'text', analyzer: 'indonesia_analyzer' },
      is_ocr: { type: 'boolean' },
      dibuat_pada: { type: 'date' },
      diperbarui_pada: { type: 'date' },
    },
  },
};

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private indexDokumen: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.indexDokumen = this.configService.get('elasticsearch.indexDokumen') || 'jdih_dokumen';
    this.client = new Client({
      node: this.configService.get('elasticsearch.node'),
    });

    await this.initializeIndex();
  }

  private async initializeIndex(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexDokumen });
      if (!exists) {
        await this.client.indices.create({
          index: this.indexDokumen,
          ...DOKUMEN_MAPPING,
        });
        this.logger.log(`Index '${this.indexDokumen}' berhasil dibuat`);
      } else {
        this.logger.log(`Index '${this.indexDokumen}' sudah ada`);
      }
    } catch (error) {
      this.logger.error('Gagal inisialisasi Elasticsearch index', error);
      throw error;
    }
  }

  /** Index atau update dokumen */
  async indexDokumenDoc(dokumen: {
    id: string;
    judul: string;
    nomor?: string;
    tahun: number;
    jenis: string;
    instansi: string;
    status: string;
    isi_teks?: string;
    kata_kunci?: string[];
    abstrak?: string;
    is_ocr: boolean;
    dibuat_pada: Date;
    diperbarui_pada: Date;
  }): Promise<void> {
    await this.client.index({
      index: this.indexDokumen,
      id: dokumen.id,
      document: {
        ...dokumen,
        dibuat_pada: dokumen.dibuat_pada.toISOString(),
        diperbarui_pada: dokumen.diperbarui_pada.toISOString(),
      },
    });
  }

  /** Hapus dokumen dari index */
  async deleteDokumen(id: string): Promise<void> {
    try {
      await this.client.delete({ index: this.indexDokumen, id });
    } catch (error: any) {
      if (error?.meta?.statusCode !== 404) throw error;
    }
  }

  /** Pencarian full-text dengan filter, highlight, dan pagination */
  async search(params: {
    query?: string;
    jenis?: string;
    instansi?: string;
    tahunDari?: number;
    tahunSampai?: number;
    halaman?: number;
    limitPerHalaman?: number;
    urutkan?: 'relevansi' | 'terbaru' | 'terlama';
  }) {
    const {
      query,
      jenis,
      instansi,
      tahunDari,
      tahunSampai,
      halaman = 1,
      limitPerHalaman = 10,
      urutkan = 'relevansi',
    } = params;

    const from = (halaman - 1) * limitPerHalaman;

    // Build query
    const must: any[] = [{ term: { status: 'aktif' } }];
    const filter: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['judul^3', 'nomor^2', 'isi_teks', 'abstrak^1.5', 'kata_kunci^2'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          minimum_should_match: '70%',
        },
      });
    }

    if (jenis) filter.push({ term: { jenis } });
    if (instansi) filter.push({ match: { 'instansi.keyword': instansi } });
    if (tahunDari || tahunSampai) {
      filter.push({ range: { tahun: { gte: tahunDari, lte: tahunSampai } } });
    }

    // Sort
    const sort: any[] = [];
    if (urutkan === 'terbaru') sort.push({ dibuat_pada: { order: 'desc' } });
    else if (urutkan === 'terlama') sort.push({ dibuat_pada: { order: 'asc' } });
    else sort.push('_score');

    const result = await this.client.search({
      index: this.indexDokumen,
      from,
      size: limitPerHalaman,
      query: {
        bool: { must, filter },
      },
      sort,
      highlight: {
        fields: {
          judul: { number_of_fragments: 1, fragment_size: 200 },
          isi_teks: { number_of_fragments: 3, fragment_size: 300 },
          abstrak: { number_of_fragments: 1, fragment_size: 200 },
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
      _source: ['id', 'judul', 'nomor', 'tahun', 'jenis', 'instansi', 'status', 'dibuat_pada'],
    });

    const hits = result.hits.hits;
    const total = typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total;

    return {
      total,
      halaman,
      limit_per_halaman: limitPerHalaman,
      total_halaman: Math.ceil(total / limitPerHalaman),
      hasil: hits.map((hit) => ({
        ...(hit._source as any),
        skor: hit._score,
        highlight: hit.highlight || {},
      })),
    };
  }

  /** Autocomplete suggestion untuk judul */
  async autocomplete(input: string, size = 5) {
    const result = await this.client.search({
      index: this.indexDokumen,
      suggest: {
        judul_suggest: {
          prefix: input,
          completion: {
            field: 'judul.suggest',
            size,
            skip_duplicates: true,
          },
        },
      },
    });

    const suggestions = (result.suggest as any)?.judul_suggest?.[0]?.options || [];
    return suggestions.map((s: any) => ({ judul: s.text, id: s._id }));
  }

  /** Agregasi untuk analytics */
  async getAggregations() {
    const result = await this.client.search({
      index: this.indexDokumen,
      size: 0,
      query: { term: { status: 'aktif' } },
      aggs: {
        per_tahun: { terms: { field: 'tahun', size: 50, order: { _key: 'desc' } } },
        per_jenis: { terms: { field: 'jenis', size: 30 } },
        per_instansi: { terms: { field: 'instansi.keyword', size: 20 } },
        total_aktif: { value_count: { field: 'id' } },
      },
    });

    return result.aggregations;
  }
}
