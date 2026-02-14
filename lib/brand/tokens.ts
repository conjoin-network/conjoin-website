export const BRAND_TOKENS = {
  spacing: {
    4: "4px",
    8: "8px",
    12: "12px",
    16: "16px",
    24: "24px",
    32: "32px",
    48: "48px"
  },
  radius: {
    md: "12px",
    lg: "16px",
    xl: "24px"
  },
  border: {
    crisp: "1px solid #e8e8e8"
  },
  shadow: {
    low: "0 8px 20px -16px rgba(16, 16, 16, 0.22)",
    mid: "0 14px 28px -18px rgba(16, 16, 16, 0.26)"
  },
  typography: {
    h1: {
      fontSize: "40px",
      lineHeight: "44px"
    },
    h2: {
      fontSize: "28px",
      lineHeight: "34px"
    },
    h3: {
      fontSize: "20px",
      lineHeight: "26px"
    },
    body: {
      fontSize: "16px",
      lineHeight: "24px"
    },
    small: {
      fontSize: "13px",
      lineHeight: "18px"
    }
  },
  colors: {
    pageBg: "#fafafa",
    surface: "#ffffff",
    border: "#e8e8e8",
    textPrimary: "#101010",
    textMuted: "#5a5a5a"
  }
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
