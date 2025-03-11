import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMethodEnum, PaymentStatusEnum } from './dto/find-payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${createPaymentDto.orderId} not found`,
      );
    }

    // Check if order has already been paid
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: createPaymentDto.orderId },
    });

    if (existingPayment) {
      throw new BadRequestException(
        `Order with ID ${createPaymentDto.orderId} has already been paid`,
      );
    }

    // Create payment and update order status
    const payment = await this.prisma.payment.create({
      data: {
        orderId: createPaymentDto.orderId,
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        status: 'success', // Default to success for demo
      },
    });

    // Update payment status of the order
    await this.prisma.order.update({
      where: { id: createPaymentDto.orderId },
      data: {
        paymentStatus: 'paid',
        paymentId: payment.id,
      },
    });

    return payment;
  }

  async findAll(
    orderId?: string,
    paymentMethod?: PaymentMethodEnum,
    status?: PaymentStatusEnum,
    skip = 0,
    take = 10,
  ) {
    const where: any = {};

    if (orderId) {
      where.orderId = orderId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id);

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
