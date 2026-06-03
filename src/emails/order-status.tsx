import * as React from "react";
import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/components/email-layout";
import { OrderDetails } from "@/emails/components/order-details";
import type { OrderEmailData } from "@/lib/email/types";

type OrderStatusEmailProps = {
  order: OrderEmailData;
  headline: string;
  message: string;
};

export function OrderStatusEmail({
  order,
  headline,
  message,
}: OrderStatusEmailProps) {
  return (
    <EmailLayout preview={`Order ${order.orderNumber}: ${headline}`} title={headline}>
      <Text style={paragraph}>Hi {order.customerName},</Text>
      <Text style={paragraph}>{message}</Text>
      <OrderDetails order={order} />
      <Section style={ctaSection}>
        <Button href={order.orderUrl} style={button}>
          Track your order
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default OrderStatusEmail;

const paragraph = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "8px",
};

const button = {
  backgroundColor: "#1B4332",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
};
