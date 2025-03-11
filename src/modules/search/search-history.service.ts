import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchHistoryService {
  private readonly logger = new Logger(SearchHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addSearchHistory(userId: string, query: string) {
    try {
      // Kiểm tra xem đã có lịch sử tìm kiếm gần đây với cùng query chưa
      const existingSearch = await this.prisma.searchHistory.findFirst({
        where: {
          userId,
          query: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Trong vòng 24 giờ
          },
        },
      });

      if (existingSearch) {
        // Nếu đã có, cập nhật thời gian
        return this.prisma.searchHistory.update({
          where: { id: existingSearch.id },
          data: {
            createdAt: new Date(),
          },
        });
      }

      // Nếu chưa có, tạo mới
      return this.prisma.searchHistory.create({
        data: {
          userId,
          query,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to add search history for user ${userId}`,
        error,
      );
    }
  }

  async getUserSearchHistory(userId: string, limit = 10) {
    try {
      return this.prisma.searchHistory.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Failed to get search history for user ${userId}`,
        error,
      );
      return [];
    }
  }

  async removeSearchHistory(id: string) {
    try {
      return this.prisma.searchHistory.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to remove search history ${id}`, error);
    }
  }

  async clearUserSearchHistory(userId: string) {
    try {
      return this.prisma.searchHistory.deleteMany({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to clear search history for user ${userId}`,
        error,
      );
    }
  }
}
