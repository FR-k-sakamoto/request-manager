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
      main: "#ff385c",
      dark: "#e00b41",
    },
    secondary: {
      main: "#222222",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
      gradient: "#ffffff",
    },
    text: {
      primary: "#222222",
      secondary: "#6a6a6a",
    },
    border: "#dddddd",
    muted: "#6a6a6a",
    surface: "#ffffff",
    status: {
      pending: { main: "#c13515", bg: "#fff7ed" },
      completed: { main: "#222222", bg: "#f2f2f2" },
      rejected: { main: "#b32505", bg: "#ffe8ee" },
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
      '"Airbnb Cereal VF", Circular, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", -apple-system, system-ui, sans-serif',
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
          background: "#ffffff",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },
  },
});
