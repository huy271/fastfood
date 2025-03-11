export class Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  stripePaymentId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
