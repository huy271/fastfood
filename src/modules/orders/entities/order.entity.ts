export class Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentId: string | null;
  shippingAddress: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}

export class OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
