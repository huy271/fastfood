import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioClientService {
  private readonly minioClient: Minio.Client;
  private readonly logger = new Logger(MinioClientService.name);
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: this.configService.get<number>('MINIO_PORT'),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ROOT_USER'),
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'default',
  ): Promise<string> {
    try {
      const objectName = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
      const metaData = {
        'Content-Type': file.mimetype,
      };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        metaData,
      );

      // Trả về URL công khai của tệp đã tải lên
      return `${this.publicUrl}/${this.bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error(
        `Error uploading file to MinIO: ${error.message}`,
        error.stack,
      );
      throw new Error(`Could not upload file: ${error.message}`);
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
    folder = 'default',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Trích xuất objectName từ URL
      const objectName = fileUrl.split(`${this.bucketName}/`)[1];
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(
        `Error deleting file from MinIO: ${error.message}`,
        error.stack,
      );
      throw new Error(`Could not delete file: ${error.message}`);
    }
  }
}
