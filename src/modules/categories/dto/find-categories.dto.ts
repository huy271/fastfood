import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindCategoriesDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term for category name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
