import { createContext, useContext, ReactNode, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme } from "@mui/material/styles";

declare module '@mui/material/styles' {
  interface TypeText {
    contrastText: string;
  }

  interface TypeBackground {
    contrastBackground: string;
  }
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            contrastBackground: '#fff',
        },
        text: {
            contrastText: '#1E1E1E',
        }
    },
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            contrastBackground: '#1E1E1E',
        },
        text: {
            contrastText: '#fff',
        }
    },
})

const themes: Record<ThemeType, Theme> = {
    light: lightTheme,
    dark: darkTheme,
}

type ThemeType = 'light' | 'dark'

interface ThemeContextType {
    theme: ThemeType
    setTheme: (value: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('light')
    return <ThemeContext.Provider value={{ theme, setTheme }}>
        <MuiThemeProvider theme={themes[theme]}>
            <CssBaseline />
            {children}
        </MuiThemeProvider></ThemeContext.Provider>;
}

export function useCtxTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
    return ctx;
}