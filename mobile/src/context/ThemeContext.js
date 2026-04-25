import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [currentTheme, setCurrentTheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setCurrentTheme(systemColorScheme || 'light');
    } else {
      setCurrentTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const toggleTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const colors = {
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#2563EB',
      secondary: '#64748B',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
      card: '#FFFFFF',
      shadow: '#000000',
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#3B82F6',
      secondary: '#94A3B8',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
      error: '#F87171',
      success: '#34D399',
      warning: '#FBBF24',
      card: '#1E293B',
      shadow: '#000000',
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme: colors[currentTheme],
        isDark: currentTheme === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
