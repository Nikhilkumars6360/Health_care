import React from 'react';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightBold: '700' as const,
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    primaryContainer: '#E8F5E9',
    secondary: '#1565C0',
    secondaryContainer: '#E3F2FD',
    tertiary: '#E65100',
    tertiaryContainer: '#FFF3E0',
    error: '#C62828',
    errorContainer: '#FDEDEC',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onBackground: '#1A1A1A',
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#4A4A4A',
    outline: '#CCCCCC',
    outlineVariant: '#E0E0E0',
    inverseSurface: '#313131',
    inverseOnSurface: '#F5F5F5',
    inversePrimary: '#A5D6A7',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0,0,0,0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#81C784',
    primaryContainer: '#1B5E20',
    secondary: '#64B5F6',
    secondaryContainer: '#0D47A1',
    tertiary: '#FFB74D',
    tertiaryContainer: '#E65100',
    error: '#EF9A9A',
    errorContainer: '#B71C1C',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onError: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    outline: '#555555',
    outlineVariant: '#444444',
    inverseSurface: '#F5F5F5',
    inverseOnSurface: '#1A1A1A',
    inversePrimary: '#2E7D32',
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0,0,0,0.7)',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const ThemeContext = React.createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = React.useState(false);
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};