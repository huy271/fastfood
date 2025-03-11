import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindUsersDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term for full name or email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
