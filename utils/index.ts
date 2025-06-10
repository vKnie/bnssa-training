// utils/index.ts
import { Question } from '../types';

/**
 * Mélange un tableau et retourne un nombre spécifié d'éléments
 */
export const getRandomElements = <T>(arr: T[], num: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

/**
 * Formate le temps en minutes:secondes
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

/**
 * Vérifie si une réponse est correcte
 */
export const isAnswerCorrect = (
  selectedAnswers: string[], 
  correctAnswers: string[]
): boolean => {
  return correctAnswers.every(answer => selectedAnswers.includes(answer)) &&
         selectedAnswers.every(answer => correctAnswers.includes(answer));
};

/**
 * Calcule le pourcentage de réussite
 */
export const calculateSuccessRate = (score: number, total: number): number => {
  return Math.round((score / total) * 100);
};

/**
 * Détermine le statut du score
 */
export const getScoreStatus = (percentage: number) => {
  if (percentage >= 75) return { text: 'Excellent!', level: 'excellent' };
  if (percentage >= 50) return { text: 'Satisfaisant', level: 'good' };
  return { text: 'À améliorer', level: 'poor' };
};

/**
 * Génère un message de fin d'entraînement basé sur le score
 */
export const getTrainingEndMessage = (score: number, total: number): string => {
  const successRate = calculateSuccessRate(score, total);
  let message = `Votre score est de ${score}/${total}`;
  
  if (successRate >= 80) {
    message += "\n\nExcellent travail ! Continuez comme ça !";
  } else if (successRate >= 60) {
    message += "\n\nBon travail ! Continuez à vous entraîner.";
  } else {
    message += "\n\nContinuez à vous entraîner pour améliorer vos résultats.";
  }
  
  return message;
};

/**
 * Valide les paramètres de navigation
 */
export const validateNavParams = (params: any): boolean => {
  return params && typeof params === 'object';
};

/**
 * Mélange les questions d'un tableau
 */
export const shuffleQuestions = (questions: Question[]): Question[] => {
  return [...questions].sort(() => 0.5 - Math.random());
};

/**
 * Filtre les questions par thèmes sélectionnés
 */
export const filterQuestionsByThemes = (
  allQuestions: Question[], 
  selectedThemes: string[]
): Question[] => {
  return allQuestions.filter(question => 
    selectedThemes.includes(question.theme_name)
  );
};

/**
 * Débounce une fonction
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};