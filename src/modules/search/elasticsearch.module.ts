import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchHistoryService } from './search-history.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SearchController } from './search.controller';
import { ElasticsearchIndexerService } from './elasticsearch-indexer.service';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node:
          configService.get('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        auth: {
          username: configService.get('ELASTICSEARCH_AUTH_USERNAME') || '',
          password: configService.get('ELASTICSEARCH_AUTH_PASSWORD') || '',
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [SearchController],
  providers: [
    ElasticsearchService,
    SearchHistoryService,
    ElasticsearchIndexerService,
  ],
  exports: [ElasticsearchService, SearchHistoryService],
})
export class SearchModule {}
