import { Readable } from 'stream';

export interface IStorageService {
  /**
   * Upload file ke object storage
   * @returns URL publik file
   */
  upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string,
  ): Promise<string>;

  /**
   * Hapus file dari object storage
   */
  delete(fileUrl: string): Promise<void>;

  /**
   * Dapatkan stream file untuk download
   */
  getStream(fileUrl: string): Promise<Readable>;

  /**
   * Dapatkan URL sementara (presigned URL) untuk akses private
   */
  getPresignedUrl(fileUrl: string, expirySecs?: number): Promise<string>;
}

export const STORAGE_SERVICE = Symbol('IStorageService');
