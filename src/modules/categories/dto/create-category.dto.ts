import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục', example: 'Đồ uống' })
  @IsNotEmpty({ message: 'Tên danh mục là bắt buộc' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Mô tả danh mục',
    required: false,
    example: 'Các loại đồ uống giải khát',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh',
    required: false,
    example: 'https://example.com/drinks.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Đường dẫn hình ảnh phải là chuỗi' })
  imageUrl?: string;
}
