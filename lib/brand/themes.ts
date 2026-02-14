import type { CSSProperties } from "react";

export type ServiceThemeKey = "workspace" | "secure" | "network" | "vision" | "access";

type ServiceTheme = {
  key: ServiceThemeKey;
  label: string;
  accent: string;
  gradientWash: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
};

const SERVICE_THEMES: Record<ServiceThemeKey, ServiceTheme> = {
  workspace: {
    key: "workspace",
    label: "Workspace",
    accent: "#1266d6",
    gradientWash: "linear-gradient(135deg, rgba(18,102,214,0.05) 0%, rgba(18,102,214,0.01) 55%, rgba(255,255,255,0.95) 100%)",
    glow: "0 14px 30px -20px rgba(18, 102, 214, 0.35)",
    badgeBg: "rgba(18, 102, 214, 0.12)",
    badgeText: "#0f53aa",
    iconBg: "rgba(18, 102, 214, 0.14)"
  },
  secure: {
    key: "secure",
    label: "Secure",
    accent: "#008861",
    gradientWash: "linear-gradient(135deg, rgba(0,136,97,0.05) 0%, rgba(0,136,97,0.01) 55%, rgba(255,255,255,0.95) 100%)",
    glow: "0 14px 30px -20px rgba(0, 136, 97, 0.35)",
    badgeBg: "rgba(0, 136, 97, 0.12)",
    badgeText: "#006648",
    iconBg: "rgba(0, 136, 97, 0.14)"
  },
  network: {
    key: "network",
    label: "Network",
    accent: "#0d4f9e",
    gradientWash: "linear-gradient(135deg, rgba(13,79,158,0.05) 0%, rgba(13,79,158,0.01) 55%, rgba(255,255,255,0.95) 100%)",
    glow: "0 14px 30px -20px rgba(13, 79, 158, 0.35)",
    badgeBg: "rgba(13, 79, 158, 0.12)",
    badgeText: "#0a3b75",
    iconBg: "rgba(13, 79, 158, 0.14)"
  },
  vision: {
    key: "vision",
    label: "Vision",
    accent: "#6b56c7",
    gradientWash: "linear-gradient(135deg, rgba(107,86,199,0.05) 0%, rgba(107,86,199,0.01) 55%, rgba(255,255,255,0.95) 100%)",
    glow: "0 14px 30px -20px rgba(107, 86, 199, 0.35)",
    badgeBg: "rgba(107, 86, 199, 0.12)",
    badgeText: "#4f3ea7",
    iconBg: "rgba(107, 86, 199, 0.14)"
  },
  access: {
    key: "access",
    label: "Access",
    accent: "#c46a10",
    gradientWash: "linear-gradient(135deg, rgba(196,106,16,0.05) 0%, rgba(196,106,16,0.01) 55%, rgba(255,255,255,0.95) 100%)",
    glow: "0 14px 30px -20px rgba(196, 106, 16, 0.35)",
    badgeBg: "rgba(196, 106, 16, 0.12)",
    badgeText: "#91500f",
    iconBg: "rgba(196, 106, 16, 0.14)"
  }
};

export function getTheme(themeKey: ServiceThemeKey): ServiceTheme {
  return SERVICE_THEMES[themeKey];
}

export function themeToCssVars(theme: ServiceTheme): CSSProperties {
  return {
    "--theme-accent": theme.accent,
    "--theme-gradient": theme.gradientWash,
    "--theme-glow": theme.glow,
    "--theme-badge-bg": theme.badgeBg,
    "--theme-badge-text": theme.badgeText,
    "--theme-icon-bg": theme.iconBg
  } as CSSProperties;
}

export function withThemeStyles(themeKey: ServiceThemeKey): CSSProperties {
  return themeToCssVars(getTheme(themeKey));
}

export const ALL_SERVICE_THEMES = SERVICE_THEMES;
