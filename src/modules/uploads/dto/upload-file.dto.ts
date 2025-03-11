import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File cần tải lên',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Thư mục lưu trữ',
    required: false,
    default: 'products',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class UploadFilesDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Các file cần tải lên',
  })
  files: Express.Multer.File[];

  @ApiProperty({
    description: 'Thư mục lưu trữ',
    required: false,
    default: 'products',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
