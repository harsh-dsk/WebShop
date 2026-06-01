import { siteConfig } from "@/config/site";

/** Injects customizable theme colors from site config into CSS variables */
export function ThemeVariables() {
  const { theme } = siteConfig;

  const css = `
    :root {
      --background: 40 33% 97%;
      --foreground: 155 30% 12%;
      --card: 35 24% 92%;
      --card-foreground: 155 30% 12%;
      --primary: 158 43% 19%;
      --primary-foreground: 40 33% 97%;
      --accent: 22 95% 46%;
      --accent-foreground: 40 33% 97%;
      --muted: 35 18% 88%;
      --muted-foreground: 155 12% 40%;
      --border: 35 20% 85%;
      --brand-primary: ${theme.primary};
      --brand-accent: ${theme.accent};
      --brand-background: ${theme.background};
      --brand-card: ${theme.card};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
