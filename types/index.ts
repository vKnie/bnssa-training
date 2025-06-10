// types/index.ts
export interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

export interface Theme {
  theme_name: string;
  questions: Question[];
}

export interface QuestionsData {
  themes: Theme[];
}

export type RootStackParamList = {
  HomeScreen: undefined;
  ExamenScreen: undefined;
  TrainingScreen: undefined;
  HistoricScreenTraining: undefined;
  TrainingSession: { selectedThemes: string[] };
  ExamenSession: undefined;
  ExamenSessionNote: {
    score: number;
    totalQuestions: number;
    selectedQuestions: Question[];
    selectedAnswers: string[][];
  };
};

export interface TouchableButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: string | number;
  iconName?: string;
  borderColor?: string;
  borderWidth?: number;
  disabled?: boolean;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'; // Nouvelle prop
}

export interface AppTheme {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  card: string;
  text: string;
  textLight: string;
  textInverse?: string;
  border?: string;
  success: string;
  error: string;
  warning?: string;
  info?: string;
  gradient?: string[];
}

export type ThemeKeyType = 'main' | 'home' | 'examen' | 'training';