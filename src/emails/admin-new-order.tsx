import * as React from "react";
import { Section, Text } from "@react-email/components";

import { EmailLayout } from "@/emails/components/email-layout";
import { OrderDetails } from "@/emails/components/order-details";
import type { AdminOrderEmailData } from "@/lib/email/order-email-data";

type AdminNewOrderEmailProps = {
  order: AdminOrderEmailData;
};

export function AdminNewOrderEmail({ order }: AdminNewOrderEmailProps) {
  return (
    <EmailLayout
      preview={`New order ${order.orderNumber} from ${order.customerName}`}
      title="New order received"
    >
      <Text style={paragraph}>
        A new order has been placed on the store. Summary below.
      </Text>
      <Section style={customerSection}>
        <Text style={label}>Customer</Text>
        <Text style={value}>{order.customerName}</Text>
        <Text style={label}>Shipping email</Text>
        <Text style={value}>{order.customerEmail}</Text>
        <Text style={label}>Phone</Text>
        <Text style={value}>{order.customerPhone}</Text>
        {order.accountEmail ? (
          <>
            <Text style={label}>Account email</Text>
            <Text style={value}>{order.accountEmail}</Text>
          </>
        ) : null}
        <Text style={label}>Shipping address</Text>
        <Text style={value}>{order.shippingAddress}</Text>
      </Section>
      <OrderDetails order={order} showStatus />
    </EmailLayout>
  );
}

export default AdminNewOrderEmail;

const paragraph = {
  color: "#444444",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const customerSection = {
  backgroundColor: "#f9f9f9",
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "20px",
};

const label = {
  color: "#888888",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  margin: "10px 0 2px",
};

const value = {
  color: "#111111",
  fontSize: "14px",
  margin: "0",
};
