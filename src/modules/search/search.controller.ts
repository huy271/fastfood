import {
  Controller,
  Get,
  Query,
  UseGuards,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchHistoryService } from './search-history.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly searchHistoryService: SearchHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search across multiple entity types' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by entity type (users, products, categories)',
    enum: ['users', 'products', 'categories'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim() === '') {
      return {
        total: 0,
        results: {
          users: { total: 0, items: [] },
          products: { total: 0, items: [] },
          categories: { total: 0, items: [] },
        },
      };
    }

    let indices: string[] = [];
    if (type) {
      switch (type) {
        case 'users':
          indices = ['users'];
          break;
        case 'products':
          indices = ['products'];
          break;
        case 'categories':
          indices = ['categories'];
          break;
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    const results = await this.elasticsearchService.search(query, indices);

    // Organize results by type
    const userResults = results.results.filter(
      (item) => item.index === 'users',
    );
    const productResults = results.results.filter(
      (item) => item.index === 'products',
    );
    const categoryResults = results.results.filter(
      (item) => item.index === 'categories',
    );

    return {
      total: results.total,
      results: {
        users: {
          total: userResults.length,
          items: userResults.slice(0, limitNum),
        },
        products: {
          total: productResults.length,
          items: productResults.slice(0, limitNum),
        },
        categories: {
          total: categoryResults.length,
          items: categoryResults.slice(0, limitNum),
        },
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('history')
  @ApiOperation({ summary: 'Save search query to user history' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async saveSearchHistory(@CurrentUser() user: any, @Query('q') query: string) {
    if (!query || query.trim() === '') {
      return { success: false, message: 'Search query is required' };
    }

    await this.searchHistoryService.addSearchHistory(user.id, query);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({ summary: 'Get user search history' })
  async getSearchHistory(@CurrentUser() user: any) {
    const history = await this.searchHistoryService.getUserSearchHistory(
      user.id,
    );
    return { total: history.length, items: history };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history/:id')
  @ApiOperation({ summary: 'Delete a specific search history entry' })
  async deleteSearchHistory(@CurrentUser() user: any, @Param('id') id: string) {
    await this.searchHistoryService.removeSearchHistory(id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history')
  @ApiOperation({ summary: 'Clear all user search history' })
  async clearSearchHistory(@CurrentUser() user: any) {
    await this.searchHistoryService.clearUserSearchHistory(user.id);
    return { success: true };
  }
}
