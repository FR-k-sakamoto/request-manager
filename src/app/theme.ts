import { createTheme } from "@mui/material/styles";

// Augment the theme to include custom tokens
declare module "@mui/material/styles" {
  interface TypeBackground {
    gradient: string;
  }
  interface Palette {
    border: string;
    muted: string;
    surface: string;
    status: {
      pending: { main: string; bg: string };
      completed: { main: string; bg: string };
      rejected: { main: string; bg: string };
    };
  }
  interface PaletteOptions {
    border?: string;
    muted?: string;
    surface?: string;
    status?: {
      pending: { main: string; bg: string };
      completed: { main: string; bg: string };
      rejected: { main: string; bg: string };
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f4f7fc",
      paper: "#ffffff",
      gradient:
        "radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 24%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)",
    },
    text: {
      primary: "#162033",
      secondary: "#66728a",
    },
    border: "#d6deed",
    muted: "#66728a",
    surface: "rgba(255, 255, 255, 0.92)",
    status: {
      pending: { main: "#d97706", bg: "rgba(245, 158, 11, 0.14)" },
      completed: { main: "#15803d", bg: "rgba(34, 197, 94, 0.14)" },
      rejected: { main: "#dc2626", bg: "rgba(248, 113, 113, 0.16)" },
    },
  },
  shadows: [
    "none",
    "0 18px 40px rgba(37, 99, 235, 0.08)",
    "0 1px 3px rgba(0,0,0,0.12)",
    "0 1px 5px rgba(0,0,0,0.12)",
    "0 2px 4px rgba(0,0,0,0.12)",
    "0 3px 5px rgba(0,0,0,0.12)",
    "0 3px 5px rgba(0,0,0,0.14)",
    "0 4px 6px rgba(0,0,0,0.14)",
    "0 5px 7px rgba(0,0,0,0.14)",
    "0 5px 8px rgba(0,0,0,0.14)",
    "0 6px 9px rgba(0,0,0,0.16)",
    "0 6px 10px rgba(0,0,0,0.16)",
    "0 7px 10px rgba(0,0,0,0.16)",
    "0 7px 11px rgba(0,0,0,0.16)",
    "0 8px 12px rgba(0,0,0,0.18)",
    "0 8px 13px rgba(0,0,0,0.18)",
    "0 9px 14px rgba(0,0,0,0.18)",
    "0 9px 15px rgba(0,0,0,0.18)",
    "0 10px 16px rgba(0,0,0,0.20)",
    "0 10px 17px rgba(0,0,0,0.20)",
    "0 11px 18px rgba(0,0,0,0.20)",
    "0 11px 19px rgba(0,0,0,0.20)",
    "0 12px 20px rgba(0,0,0,0.22)",
    "0 12px 21px rgba(0,0,0,0.22)",
    "0 13px 22px rgba(0,0,0,0.22)",
  ],
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: "100%",
        },
        body: {
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 24%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },
  },
});
