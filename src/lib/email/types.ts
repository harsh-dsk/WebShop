import type { OrderStatus } from "@prisma/client";

export type OrderEmailItem = {
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type OrderEmailData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  statusLabel: string;
  items: OrderEmailItem[];
  subtotal: string;
  shippingCost: string;
  tax: string;
  total: string;
  expectedDeliveryDate: string | null;
  shippingAddress: string;
  orderUrl: string;
};
