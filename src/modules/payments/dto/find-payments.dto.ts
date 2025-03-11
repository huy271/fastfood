import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum PaymentMethodEnum {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

export enum PaymentStatusEnum {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export class FindPaymentsDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by order ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    description: 'Filter by payment method',
    required: false,
    enum: PaymentMethodEnum,
  })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @ApiProperty({
    description: 'Filter by payment status',
    required: false,
    enum: PaymentStatusEnum,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum;
}
