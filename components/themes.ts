import { Platform, TextStyle } from 'react-native';

// Thèmes pour les différentes sections de l'application
export const appThemes = {
  // Thème général de l'application
  main: {
    primary: '#3766B7',
    secondary: '#6C8DC2',
    accent: '#4CAF50',
    background: '#F5F7FA',
    text: '#333333',
    textLight: '#666666',
    textInverse: '#FFFFFF',
    border: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  // Thème pour la section Home
  home: {
    primary: '#3099EF',
    secondary: '#64B5F6',
    gradient: ['#3099EF', '#64B5F6'],
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
  },
  
  // Thème pour la section Examen
  examen: {
    primary: '#1e3c72',
    secondary: '#2a5298',
    gradient: ['#1e3c72', '#2a5298'],
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    accent: '#FF9800',
  },
  
  // Thème pour la section Training
  training: {
    primary: '#FF5F6D',
    secondary: '#FFC371',
    gradient: ['#FF5F6D', '#FFC371'],
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    accent: '#4CAF50',
  },
};

// Types pour les thèmes
export type ThemeType = typeof appThemes.main;
export type ThemeKeyType = keyof typeof appThemes;

// Style de header commun pour toutes les pages
export const headerStyles = {
  common: {
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold' as TextStyle['fontWeight'],
      fontSize: 18,
    },
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
      height: Platform.OS === 'ios' ? 100 : 60,
    },
    headerTintColor: '#FFFFFF',
  },
  
  // Styles de header spécifiques pour chaque section
  home: {
    headerStyle: {
      backgroundColor: appThemes.home.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
      height: Platform.OS === 'ios' ? 100 : 60,
    },
  },
  
  examen: {
    headerStyle: {
      backgroundColor: appThemes.examen.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
      height: Platform.OS === 'ios' ? 100 : 60,
    },
  },
  
  training: {
    headerStyle: {
      backgroundColor: appThemes.training.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
      height: Platform.OS === 'ios' ? 100 : 60,
    },
  },
};

// Mapping des écrans aux thèmes
export const screenToTheme: Record<string, ThemeKeyType> = {
  HomeScreen: 'home',
  ExamenScreen: 'examen',
  ExamenSession: 'examen',
  ExamenSessionNote: 'examen',
  HistoricScreenExamen: 'examen',
  TrainingScreen: 'training',
  TrainingSession: 'training',
  HistoricScreenTraining: 'training',
};

// Shadow styles communs pour différentes élévations
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
  }),
};

// Thèmes pour les icônes et emojis utilisés dans l'application
export const themeIcons = {
  'Connaissance du milieu': '🏊',
  'Diplômes, compétences et obligations': '🎓',
  'Organisation administrative': '📋',
  'Organisation de la sécurité': '🛡️',
  'Surveillance et sécurité des activités spécifiques': '👁️',
  'Conduite à tenir en cas d\'accident - Premiers secours': '🚑',
};

// Couleurs associées aux thèmes
export const themeColors: Record<string, string> = {
  'Connaissance du milieu': '#4CAF50',
  'Diplômes, compétences et obligations': '#2196F3',
  'Organisation administrative': '#FF9800',
  'Organisation de la sécurité': '#F44336',
  'Surveillance et sécurité des activités spécifiques': '#9C27B0',
  'Conduite à tenir en cas d\'accident - Premiers secours': '#E91E63',
};

// Liste des thèmes pour les entrainements
export const themes = [
  'Connaissance du milieu',
  'Diplômes, compétences et obligations',
  'Organisation administrative',
  'Organisation de la sécurité',
  'Surveillance et sécurité des activités spécifiques',
  'Conduite à tenir en cas d\'accident - Premiers secours',
];

// Tailles standardisées pour la typographie
export const typography = {
  heading1: 24,
  heading2: 20,
  heading3: 18,
  body1: 16,
  body2: 14,
  caption: 12,
  button: 16,
  
  // Utiliser les valeurs acceptées par TextStyle['fontWeight']
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
};

// Arrondis standardisés
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// Utiliser ce hook pour obtenir le thème actuel en fonction du nom de l'écran
export const getThemeForScreen = (screenName: string): ThemeType => {
  const themeKey = screenToTheme[screenName] || 'main';
  return appThemes[themeKey];
};

export default {
  appThemes,
  headerStyles,
  shadowStyles,
  themes,
  themeIcons,
  themeColors,
  typography,
  spacing,
  borderRadius,
  getThemeForScreen,
};