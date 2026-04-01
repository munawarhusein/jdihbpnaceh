import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ElasticsearchService } from '../../integrations/elasticsearch/elasticsearch.service';
import { FilterDokumenDto } from '../dokumen/dto/filter-dokumen.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

class AutocompleteDto {
  @IsString()
  @MaxLength(100)
  q: string;
}

@Controller('pencarian')
export class PencarianController {
  constructor(private readonly elasticsearch: ElasticsearchService) {}

  /** GET /pencarian — Full-text search */
  @Public()
  @Get()
  async cari(@Query() filter: FilterDokumenDto) {
    return this.elasticsearch.search({
      query: filter.q,
      jenis: filter.jenis,
      instansi: filter.instansi,
      tahunDari: filter.tahun,
      tahunSampai: filter.tahun,
      halaman: filter.halaman,
      limitPerHalaman: filter.limit,
      urutkan: filter.urutkan,
    });
  }

  /** GET /pencarian/autocomplete — Suggest judul dokumen */
  @Public()
  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    if (!q || q.length < 2) return { saran: [] };
    const hasil = await this.elasticsearch.autocomplete(q);
    return { saran: hasil };
  }

  /** GET /pencarian/agregasi — Data untuk filter UI (jenis, instansi, tahun) */
  @Public()
  @Get('agregasi')
  async agregasi() {
    return this.elasticsearch.getAggregations();
  }
}
