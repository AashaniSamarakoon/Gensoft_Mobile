import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      white: '#ffffff',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#64748b',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      disabled: '#d1d5db',
      // Additional colors from client reference
      cardBackground: '#ffffff',
      inputBackground: '#f3f4f6',
      headerBackground: '#667eea',
      gradientStart: '#667eea',
      gradientEnd: '#764ba2'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};