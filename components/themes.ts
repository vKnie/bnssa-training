// components/themes.ts
import { Platform, TextStyle } from 'react-native';
import { AppTheme, ThemeKeyType } from '../types';

// Thèmes optimisés avec une structure cohérente
export const appThemes: Record<ThemeKeyType, AppTheme> = {
  main: {
    primary: '#3766B7',
    secondary: '#6C8DC2',
    accent: '#4CAF50',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    textInverse: '#FFFFFF',
    border: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  home: {
    primary: '#3099EF',
    secondary: '#64B5F6',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    success: '#4CAF50',
    error: '#F44336',
    gradient: ['#3099EF', '#64B5F6'],
  },
  
  examen: {
    primary: '#1e3c72',
    secondary: '#2a5298',
    accent: '#FF9800',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    success: '#4CAF50',
    error: '#F44336',
    gradient: ['#1e3c72', '#2a5298'],
  },
  
  training: {
    primary: '#FF5F6D',
    secondary: '#FFC371',
    accent: '#4CAF50',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    success: '#4CAF50',
    error: '#F44336',
    gradient: ['#FF5F6D', '#FFC371'],
  },
};

// Mapping optimisé des écrans aux thèmes
export const screenToTheme: Record<string, ThemeKeyType> = {
  HomeScreen: 'home',
  ExamenScreen: 'examen',
  ExamenSession: 'examen',
  ExamenSessionNote: 'examen',
  TrainingScreen: 'training',
  TrainingSession: 'training',
  HistoricScreenTraining: 'training',
};

// Shadow styles optimisés avec memoization
export const shadowStyles = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

// Configuration de typographie standardisée
export const typography = {
  heading1: 24,
  heading2: 20,
  heading3: 18,
  body1: 16,
  body2: 14,
  caption: 12,
  button: 16,
  
  fontWeightRegular: '400' as TextStyle['fontWeight'],
  fontWeightMedium: '500' as TextStyle['fontWeight'],
  fontWeightBold: '700' as TextStyle['fontWeight'],
};

// Espacement standardisé
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

// Arrondis standardisés
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
} as const;

// Icônes pour les thèmes d'entraînement
export const themeIcons: Record<string, string> = {
  'Connaissance du milieu': '🏊',
  'Diplômes, compétences et obligations': '🎓',
  'Organisation administrative': '📋',
  'Organisation de la sécurité': '🛡️',
  'Surveillance et sécurité des activités spécifiques': '👁️',
  'Conduite à tenir en cas d\'accident - Premiers secours': '🚑',
};

// Couleurs pour les thèmes d'entraînement
export const themeColors: Record<string, string> = {
  'Connaissance du milieu': '#4CAF50',
  'Diplômes, compétences et obligations': '#2196F3',
  'Organisation administrative': '#FF9800',
  'Organisation de la sécurité': '#F44336',
  'Surveillance et sécurité des activités spécifiques': '#9C27B0',
  'Conduite à tenir en cas d\'accident - Premiers secours': '#E91E63',
};

// Cache pour les thèmes
const themeCache = new Map<string, AppTheme>();

// Hook optimisé pour obtenir le thème avec cache
export const getThemeForScreen = (screenName: string): AppTheme => {
  if (themeCache.has(screenName)) {
    return themeCache.get(screenName)!;
  }
  
  const themeKey = screenToTheme[screenName] || 'main';
  const theme = appThemes[themeKey];
  
  themeCache.set(screenName, theme);
  return theme;
};

// Utilitaires pour les couleurs de thèmes
export const getThemeColor = (themeName: string, defaultColor: string): string => {
  return themeColors[themeName] || defaultColor;
};

export const getThemeIcon = (themeName: string, defaultIcon: string): string => {
  return themeIcons[themeName] || defaultIcon;
};