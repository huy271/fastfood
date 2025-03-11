import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục', required: false })
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name?: string;

  @ApiProperty({ description: 'Mô tả danh mục', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({ description: 'Đường dẫn hình ảnh', required: false })
  @IsOptional()
  @IsString({ message: 'Đường dẫn hình ảnh phải là chuỗi' })
  imageUrl?: string;
}
