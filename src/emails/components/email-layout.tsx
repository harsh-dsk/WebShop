import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";

type EmailLayoutProps = {
  preview: string;
  title: string;
  children: ReactNode;
};

export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandHeading}>{siteConfig.brand.name}</Heading>
            <Text style={brandTagline}>{siteConfig.brand.tagline}</Text>
          </Section>
          <Heading as="h2" style={titleStyle}>
            {title}
          </Heading>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            {siteConfig.contact.email} · {siteConfig.contact.phone}
          </Text>
          <Text style={footerMuted}>
            You received this email because of activity on your {siteConfig.brand.name}{" "}
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const header = {
  marginBottom: "24px",
};

const brandHeading = {
  color: "#1B4332",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const brandTagline = {
  color: "#666666",
  fontSize: "13px",
  margin: "0",
};

const titleStyle = {
  color: "#111111",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const footer = {
  color: "#444444",
  fontSize: "12px",
  margin: "0 0 8px",
};

const footerMuted = {
  color: "#888888",
  fontSize: "11px",
  margin: "0",
};
