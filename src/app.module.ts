import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MinioClientModule } from './modules/shared/minio/minio-client.module';
import { SearchModule } from './modules/search/elasticsearch.module';

/**
 * Main application module
 * Importing all modules for the application
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    UploadsModule,
    MinioClientModule,
    SearchModule,
  ],
})
export class AppModule {}
