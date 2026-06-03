import * as React from "react";
import { Column, Row, Section, Text } from "@react-email/components";

import type { OrderEmailData } from "@/lib/email/types";

type OrderDetailsProps = {
  order: OrderEmailData;
  showStatus?: boolean;
};

export function OrderDetails({ order, showStatus = true }: OrderDetailsProps) {
  return (
    <>
      <Section style={metaSection}>
        <Row>
          <Column>
            <Text style={label}>Order ID</Text>
            <Text style={value}>{order.orderNumber}</Text>
          </Column>
          {showStatus ? (
            <Column align="right">
              <Text style={label}>Status</Text>
              <Text style={value}>{order.statusLabel}</Text>
            </Column>
          ) : null}
        </Row>
        <Text style={label}>Customer</Text>
        <Text style={value}>{order.customerName}</Text>
        {order.expectedDeliveryDate ? (
          <>
            <Text style={label}>Expected delivery</Text>
            <Text style={value}>{order.expectedDeliveryDate}</Text>
          </>
        ) : null}
      </Section>

      <Section style={tableSection}>
        <Row style={tableHeader}>
          <Column style={colProduct}>Product</Column>
          <Column style={colQty}>Qty</Column>
          <Column style={colPrice} align="right">
            Total
          </Column>
        </Row>
        {order.items.map((item, index) => (
          <Row key={`${item.productName}-${index}`} style={tableRow}>
            <Column style={colProduct}>{item.productName}</Column>
            <Column style={colQty}>{item.quantity}</Column>
            <Column style={colPrice} align="right">
              {item.lineTotal}
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={totalsSection}>
        <Row>
          <Column>
            <Text style={totalLabel}>Order total</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{order.total}</Text>
          </Column>
        </Row>
      </Section>
    </>
  );
}

const metaSection = {
  marginBottom: "20px",
};

const label = {
  color: "#888888",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "12px 0 4px",
};

const value = {
  color: "#111111",
  fontSize: "14px",
  margin: "0",
};

const tableSection = {
  border: "1px solid #e6e6e6",
  borderRadius: "6px",
  padding: "12px",
  marginBottom: "16px",
};

const tableHeader = {
  borderBottom: "1px solid #e6e6e6",
  paddingBottom: "8px",
  marginBottom: "8px",
};

const tableRow = {
  padding: "6px 0",
};

const colProduct = { width: "55%", fontSize: "13px", color: "#333333" };
const colQty = { width: "15%", fontSize: "13px", color: "#333333" };
const colPrice = { width: "30%", fontSize: "13px", color: "#333333" };

const totalsSection = {
  marginTop: "8px",
};

const totalLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111111",
  margin: "0",
};

const totalValue = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#1B4332",
  margin: "0",
};
