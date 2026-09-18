import { pixelBasedPreset } from "@react-email/components";

/** React Email resolves these tokens to inline CSS before delivery. */
export const emailTheme = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      borderRadius: { xl: "12px" },
      colors: {
        background: "#f6f6f4",
        card: "#ffffff",
        foreground: "#1c1c1a",
        "muted-foreground": "#6b6b66",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: { sm: "15px" },
      letterSpacing: { wide: "0.04em" },
      lineHeight: { relaxed: "1.6" },
      maxWidth: { xl: "560px" },
    },
  },
};
