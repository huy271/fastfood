import { Injectable } from '@nestjs/common';
import { MinioClientService } from '../shared/minio/minio-client.service';

@Injectable()
export class UploadsService {
  constructor(private readonly minioClientService: MinioClientService) {}

  async uploadSingleFile(
    file: Express.Multer.File,
    folder = 'products',
  ): Promise<string> {
    return this.minioClientService.uploadFile(file, folder);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder = 'products',
  ): Promise<string[]> {
    return this.minioClientService.uploadFiles(files, folder);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.minioClientService.deleteFile(fileUrl);
  }
}
