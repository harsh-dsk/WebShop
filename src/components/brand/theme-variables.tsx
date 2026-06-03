import { hexToHslChannels } from "@/lib/color-utils";
import type { RuntimeSiteConfig } from "@/lib/site-runtime";

type ThemeVariablesProps = {
  config: RuntimeSiteConfig;
};

/** Injects customizable theme colors from database settings into CSS variables */
export function ThemeVariables({ config }: ThemeVariablesProps) {
  const { themeColors } = config;

  const primary = hexToHslChannels(themeColors.button);
  const accent = hexToHslChannels(themeColors.accent);
  const background = hexToHslChannels(themeColors.background);
  const foreground = hexToHslChannels(themeColors.text);
  const card = hexToHslChannels(themeColors.secondary);
  const brandPrimary = hexToHslChannels(themeColors.primary);

  const css = `
    :root {
      --background: ${background};
      --foreground: ${foreground};
      --card: ${card};
      --card-foreground: ${foreground};
      --primary: ${primary};
      --primary-foreground: ${background};
      --accent: ${accent};
      --accent-foreground: ${background};
      --muted: ${card};
      --muted-foreground: ${foreground};
      --border: ${card};
      --brand-primary: ${brandPrimary};
      --brand-accent: ${accent};
      --brand-background: ${background};
      --brand-card: ${card};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
