import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'User email, used for login' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Delivery address' })
  address?: string;

  @Exclude()
  password: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account update date' })
  updatedAt: Date;
}
