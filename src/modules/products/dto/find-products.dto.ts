import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindProductsDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term for product name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
