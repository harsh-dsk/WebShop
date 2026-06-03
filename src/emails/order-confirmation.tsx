import * as React from "react";
import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/components/email-layout";
import { OrderDetails } from "@/emails/components/order-details";
import type { OrderEmailData } from "@/lib/email/types";

type OrderConfirmationEmailProps = {
  order: OrderEmailData;
};

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  return (
    <EmailLayout
      preview={`Order ${order.orderNumber} confirmed — thank you for your purchase`}
      title="Order confirmation"
    >
      <Text style={paragraph}>
        Hi {order.customerName}, thank you for your order. We have received it and will
        keep you updated as it progresses.
      </Text>
      <OrderDetails order={order} />
      <Section style={ctaSection}>
        <Button href={order.orderUrl} style={button}>
          View your order
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;

const paragraph = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
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
