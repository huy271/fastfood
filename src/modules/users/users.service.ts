import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordHelper } from '../../common/helpers/password.helper';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * Map Prisma user model to User entity
   * Removes password and converts role to proper enum value
   * @param user Prisma user model
   * @returns User entity
   */
  private mapToEntity(user: any): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Convert Prisma enum to UserRole enum
    return {
      ...userWithoutPassword,
      role: user.role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER,
    } as User;
  }

  /**
   * Map multiple Prisma user models to User entities
   * @param users Array of Prisma user models
   * @returns Array of User entities
   */
  private mapToEntities(users: any[]): User[] {
    return users.map((user) => this.mapToEntity(user));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    // Hash the password
    const hashedPassword = await PasswordHelper.hash(createUserDto.password);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Index user in Elasticsearch
    await this.elasticsearchService.indexUser(user);

    return this.mapToEntity(user);
  }

  async findAll(
    search?: string,
    skip = 0,
    take = 10,
  ): Promise<{ data: User[]; total: number }> {
    const or = search
      ? [
          {
            fullName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ]
      : undefined;

    const where = or ? { OR: or } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: this.mapToEntities(users), total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.mapToEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    // If updating password, hash the new password
    if (updateUserDto.password) {
      updateUserDto.password = await PasswordHelper.hash(
        updateUserDto.password,
      );
    }

    // Update user information
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Update user in Elasticsearch
    await this.elasticsearchService.indexUser(updatedUser);

    return this.mapToEntity(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // Remove user from Elasticsearch
    await this.elasticsearchService.removeUser(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
