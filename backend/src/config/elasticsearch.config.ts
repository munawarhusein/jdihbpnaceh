import { registerAs } from '@nestjs/config';

export const elasticsearchConfig = registerAs('elasticsearch', () => ({
  node: `http://${process.env.ES_HOST || 'localhost'}:${process.env.ES_PORT || '9200'}`,
  indexDokumen: process.env.ES_INDEX_DOKUMEN || 'jdih_dokumen',
}));
