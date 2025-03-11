import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from './dto/find-orders.dto';
import { Order, OrderItem } from './entities/order.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Map Prisma order item model to OrderItem entity
   * Converts Decimal price to number
   * @param orderItem Prisma order item model
   * @returns OrderItem entity
   */
  private mapToOrderItemEntity(orderItem: any): OrderItem {
    return {
      ...orderItem,
      price: orderItem.price instanceof Prisma.Decimal
        ? parseFloat(orderItem.price.toString())
        : orderItem.price,
    } as OrderItem;
  }

  /**
   * Map Prisma order model to Order entity
   * Converts Decimal amounts to numbers and removes payment/user relations
   * @param order Prisma order model
   * @returns Order entity
   */
  private mapToOrderEntity(order: any): Order {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { payment, user, ...orderData } = order;

    return {
      ...orderData,
      totalAmount: order.totalAmount instanceof Prisma.Decimal
        ? parseFloat(order.totalAmount.toString())
        : order.totalAmount,
      orderItems: order.orderItems
        ? order.orderItems.map((item) => this.mapToOrderItemEntity(item))
        : undefined,
    } as Order;
  }

  /**
   * Map multiple Prisma order models to Order entities
   * @param orders Array of Prisma order models
   * @returns Array of Order entities
   */
  private mapToOrderEntities(orders: any[]): Order[] {
    return orders.map((order) => this.mapToOrderEntity(order));
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // Calculate the total amount of the order
    const orderItems = await Promise.all(
      createOrderDto.orderItems.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      }),
    );

    const totalAmount = orderItems.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0,
    );

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        phoneNumber: createOrderDto.phoneNumber,
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return this.mapToOrderEntity(order);
  }

  async findAll(
    userId?: string,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    skip = 0,
    take = 10,
  ) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({
        where,
      }),
    ]);

    return {
      data: this.mapToOrderEntities(orders),
      total,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToOrderEntity(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    // Ignore orderItems from updateOrderDto for now, handle them separately if needed
    const { orderItems, ...orderData } = updateOrderDto;

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: orderData,
      include: {
        orderItems: true,
      },
    });

    return this.mapToOrderEntity(updatedOrder);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    });

    await this.prisma.order.delete({
      where: { id },
    });
  }
}
