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
  HistoricScreen: undefined;
  HistoricScreenTraining: undefined;
  
  TrainingSession: {
    selectedThemes: string[];
    instantAnswerMode?: boolean;
  };
  
  ExamenSession: undefined;
  
  ExamenSessionNote: {
    score: number;
    totalQuestions: number;
    selectedQuestions: Question[];
    selectedAnswers: string[][];
    examStartTime?: number;
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
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
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

export interface ExamSession {
  id?: number;
  examDate: string;
  duration: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number;
  isPassed: boolean;
}

export interface ThemeResult {
  id?: number;
  examSessionId: number;
  themeName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number;
}

export interface DetailedExamResult {
  examSession: ExamSession;
  themeResults: ThemeResult[];
}

export interface GeneralStats {
  totalExams: number;
  passedExams: number;
  averageScore: number;
  bestScore: number;
  successRate: number;
}

export interface ThemeStats {
  themeName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  successRate: number;
  averageScore: number;
}

export type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SessionType = 'exam' | 'training';

export interface AnswerValidationResult {
  isCorrect: boolean;
  selectedAnswers: string[];
  correctAnswers: string[];
  missingAnswers: string[];
  extraAnswers: string[];
}

export interface QuestionFilter {
  themes?: string[];
  difficulty?: DifficultyLevel;
  maxQuestions?: number;
  excludeAnswered?: boolean;
}

export interface TrainingSessionOptions {
  selectedThemes: string[];
  instantAnswerMode: boolean;
  maxQuestions?: number;
  shuffleQuestions: boolean;
  showExplanations: boolean;
}