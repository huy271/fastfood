import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';

export class Product {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Image URL' })
  imageUrl?: string;

  @ApiProperty({ description: 'Available status' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Product creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Product update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Category information' })
  category?: Category;
}
