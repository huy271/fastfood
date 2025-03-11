import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * Map Prisma category model to Category entity
   * Removes products relation
   * @param category Prisma category model
   * @returns Category entity
   */
  private mapToEntity(category: any): Category {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { products, ...categoryData } = category;
    return categoryData as Category;
  }

  /**
   * Map multiple Prisma category models to Category entities
   * @param categories Array of Prisma category models
   * @returns Array of Category entities
   */
  private mapToEntities(categories: any[]): Category[] {
    return categories.map((category) => this.mapToEntity(category));
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    // Index category in Elasticsearch
    await this.elasticsearchService.indexCategory(category);

    return this.mapToEntity(category);
  }

  async findAll(
    name?: string,
    skip = 0,
    take = 10,
  ): Promise<{ data: Category[]; total: number }> {
    const where = name
      ? {
          name: {
            contains: name,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        include: {
          products: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data: this.mapToEntities(categories), total };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.mapToEntity(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(id);

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    // Update category in Elasticsearch
    await this.elasticsearchService.indexCategory(updatedCategory);

    return this.mapToEntity(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // Remove category from Elasticsearch
    await this.elasticsearchService.removeCategory(id);

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
