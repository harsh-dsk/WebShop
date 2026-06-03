/** Converts #RRGGBB or #RGB to HSL channels for Tailwind: "h s% l%" */
export function hexToHslChannels(hex: string): string {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[\da-f]{3}$|^[\da-f]{6}$/i.test(normalized)) {
    return "158 43% 19%";
  }

  let r: number;
  let g: number;
  let b: number;

  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function isValidHexColor(value: string): boolean {
  return /^#?([\da-f]{3}|[\da-f]{6})$/i.test(value.trim());
}

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
