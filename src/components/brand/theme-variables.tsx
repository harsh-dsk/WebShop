import { hexToHslChannels } from "@/lib/color-utils";
import type { RuntimeSiteConfig } from "@/lib/site-runtime";

type ThemeVariablesProps = {
  config: RuntimeSiteConfig;
};

type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  button: string;
};

export function applyThemeVariables(colors: ThemeColors) {
  if (typeof document === "undefined") return;

  const variableMap: Record<string, string> = {
    "--background": colors.background,
    "--foreground": colors.text,
    "--card": colors.secondary,
    "--card-foreground": colors.text,
    "--primary": colors.button,
    "--primary-foreground": colors.background,
    "--accent": colors.accent,
    "--accent-foreground": colors.background,
    "--muted": colors.secondary,
    "--muted-foreground": colors.text,
    "--border": colors.secondary,
    "--ring": colors.button,
    "--brand-primary": colors.primary,
    "--brand-accent": colors.accent,
    "--brand-background": colors.background,
    "--brand-card": colors.secondary,
  };

  for (const [variable, hexValue] of Object.entries(variableMap)) {
    document.documentElement.style.setProperty(variable, hexToHslChannels(hexValue));
  }
}

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
      --ring: ${primary};
      --brand-primary: ${brandPrimary};
      --brand-accent: ${accent};
      --brand-background: ${background};
      --brand-card: ${card};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
