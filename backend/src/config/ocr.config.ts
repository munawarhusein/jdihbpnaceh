import { registerAs } from '@nestjs/config';

export const ocrConfig = registerAs('ocr', () => ({
  language: process.env.OCR_LANGUAGE || 'ind+eng',
  textThreshold: parseInt(process.env.OCR_TEXT_THRESHOLD || '100', 10),
  tesseractPath: process.env.TESSERACT_PATH || undefined,
}));
