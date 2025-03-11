import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable()
export class ElasticsearchIndexerService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchIndexerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    // Give Elasticsearch time to start up
    setTimeout(async () => {
      await this.indexExistingData();
    }, 10000); // Wait 10 seconds
  }

  private async indexExistingData() {
    try {
      this.logger.log('Starting to index existing data to Elasticsearch...');

      // Index all products
      const products = await this.prisma.product.findMany({
        include: { category: true },
      });
      for (const product of products) {
        await this.elasticsearchService.indexProduct(product);
      }
      this.logger.log(`Indexed ${products.length} products to Elasticsearch`);

      // Index all users
      const users = await this.prisma.user.findMany();
      for (const user of users) {
        await this.elasticsearchService.indexUser(user);
      }
      this.logger.log(`Indexed ${users.length} users to Elasticsearch`);

      // Index all categories
      const categories = await this.prisma.category.findMany();
      for (const category of categories) {
        await this.elasticsearchService.indexCategory(category);
      }
      this.logger.log(`Indexed ${categories.length} categories to Elasticsearch`);

      this.logger.log('Successfully indexed all existing data to Elasticsearch');
    } catch (error) {
      this.logger.error('Failed to index existing data to Elasticsearch', error);
    }
  }
}
