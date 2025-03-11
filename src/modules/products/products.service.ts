import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ElasticsearchService } from '../search/elasticsearch.service';
import { Prisma } from '@prisma/client';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * Map Prisma product model to Product entity
   * Converts Decimal price to number and removes orderItems relation
   * @param product Prisma product model
   * @returns Product entity
   */
  private mapToEntity(product: any): Product {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orderItems, ...productData } = product;

    return {
      ...productData,
      price: product.price instanceof Prisma.Decimal
        ? parseFloat(product.price.toString())
        : product.price,
    } as Product;
  }

  /**
   * Map multiple Prisma product models to Product entities
   * @param products Array of Prisma product models
   * @returns Array of Product entities
   */
  private mapToEntities(products: any[]): Product[] {
    return products.map((product) => this.mapToEntity(product));
  }

  async create(createProductDto: CreateProductDto) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createProductDto.categoryId} does not exist`,
      );
    }

    // Create new product
    const product = await this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });

    // Index product in Elasticsearch
    await this.elasticsearchService.indexProduct(product);

    return this.mapToEntity(product);
  }

  async findAll(name?: string, categoryId?: string, skip = 0, take = 10) {
    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: Prisma.QueryMode.insensitive };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: this.mapToEntities(data), total };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapToEntity(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Check if product exists
    await this.findOne(id);

    // If updating categoryId, check if category exists
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateProductDto.categoryId} does not exist`,
        );
      }
    }

    // Update product
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });

    // Update product in Elasticsearch
    await this.elasticsearchService.indexProduct(updatedProduct);

    return this.mapToEntity(updatedProduct);
  }

  async remove(id: string) {
    // Check if product exists
    await this.findOne(id);

    // Remove product from Elasticsearch
    await this.elasticsearchService.removeProduct(id);

    // Delete product
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategory(categoryId: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Find all products in category
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true,
      },
    });

    return this.mapToEntities(products);
  }
}
