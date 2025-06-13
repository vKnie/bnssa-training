// utils/index.ts
import { Question } from '../types';

// === UTILITAIRES POUR LA GESTION DES TABLEAUX ===

/**
 * Mélange un tableau et retourne un nombre spécifié d'éléments
 * Utilise l'algorithme de Fisher-Yates simplifié pour le mélange aléatoire
 * @param arr - Tableau source à mélanger
 * @param num - Nombre d'éléments à retourner
 * @returns Tableau mélangé avec le nombre d'éléments demandé
 */
export const getRandomElements = <T>(arr: T[], num: number): T[] => {
  // Création d'une copie pour éviter la mutation du tableau original
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  // Retourne seulement le nombre d'éléments demandé
  return shuffled.slice(0, num);
};

// === UTILITAIRES POUR LE FORMATAGE DU TEMPS ===

/**
 * Formate le temps en minutes:secondes pour l'affichage du timer
 * @param seconds - Nombre total de secondes
 * @returns String formaté "MM:SS" (ex: "05:30", "12:07")
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // Ajoute un zéro devant les secondes si < 10 pour le format MM:SS
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// === UTILITAIRES POUR LA VALIDATION DES RÉPONSES ===

/**
 * Vérifie si une réponse est correcte en comparant les sélections utilisateur
 * avec les bonnes réponses (gestion des questions à réponses multiples)
 * @param selectedAnswers - Réponses sélectionnées par l'utilisateur
 * @param correctAnswers - Bonnes réponses attendues
 * @returns true si toutes les bonnes réponses sont sélectionnées ET aucune mauvaise
 */
export const isAnswerCorrect = (
  selectedAnswers: string[],
  correctAnswers: string[]
): boolean => {
  // Vérification bidirectionnelle :
  // 1. Toutes les bonnes réponses sont sélectionnées
  return correctAnswers.every(answer => selectedAnswers.includes(answer)) &&
         // 2. Aucune mauvaise réponse n'est sélectionnée
         selectedAnswers.every(answer => correctAnswers.includes(answer));
};

// === UTILITAIRES POUR LE CALCUL DES SCORES ===

/**
 * Calcule le pourcentage de réussite arrondi à l'entier le plus proche
 * @param score - Nombre de bonnes réponses
 * @param total - Nombre total de questions
 * @returns Pourcentage arrondi (0-100)
 */
export const calculateSuccessRate = (score: number, total: number): number => {
  return Math.round((score / total) * 100);
};

/**
 * Détermine le statut du score avec niveau de performance
 * Utilisé pour l'affichage coloré et les messages de feedback
 * @param percentage - Pourcentage de réussite
 * @returns Objet avec texte d'affichage et niveau de performance
 */
export const getScoreStatus = (percentage: number) => {
  if (percentage >= 75) return { text: 'Excellent!', level: 'excellent' };
  if (percentage >= 50) return { text: 'Satisfaisant', level: 'good' };
  return { text: 'À améliorer', level: 'poor' };
};

/**
 * Génère un message de fin d'entraînement personnalisé basé sur le score
 * Encourage l'utilisateur selon ses performances
 * @param score - Nombre de bonnes réponses
 * @param total - Nombre total de questions
 * @returns Message motivationnel personnalisé
 */
export const getTrainingEndMessage = (score: number, total: number): string => {
  const successRate = calculateSuccessRate(score, total);
  let message = `Votre score est de ${score}/${total}`;
 
  // Messages motivationnels selon le niveau de réussite
  if (successRate >= 80) {
    message += "\n\nExcellent travail ! Continuez comme ça !";
  } else if (successRate >= 60) {
    message += "\n\nBon travail ! Continuez à vous entraîner.";
  } else {
    message += "\n\nContinuez à vous entraîner pour améliorer vos résultats.";
  }
 
  return message;
};

// === UTILITAIRES POUR LA VALIDATION ===

/**
 * Valide les paramètres de navigation pour éviter les erreurs
 * Vérification de base de la structure des paramètres
 * @param params - Paramètres à valider
 * @returns true si les paramètres sont valides
 */
export const validateNavParams = (params: any): boolean => {
  return params && typeof params === 'object';
};

// === UTILITAIRES SPÉCIFIQUES AUX QUESTIONS ===

/**
 * Mélange les questions d'un tableau sans muter l'original
 * Utilisé pour randomiser l'ordre des questions dans les sessions
 * @param questions - Tableau de questions à mélanger
 * @returns Nouveau tableau avec questions mélangées
 */
export const shuffleQuestions = (questions: Question[]): Question[] => {
  // Création d'une copie avant mélange pour préserver l'original
  return [...questions].sort(() => 0.5 - Math.random());
};

/**
 * Filtre les questions par thèmes sélectionnés
 * Utilisé pour créer des sessions d'entraînement ciblées
 * @param allQuestions - Toutes les questions disponibles
 * @param selectedThemes - Noms des thèmes sélectionnés
 * @returns Questions appartenant aux thèmes sélectionnés
 */
export const filterQuestionsByThemes = (
  allQuestions: Question[],
  selectedThemes: string[]
): Question[] => {
  return allQuestions.filter(question =>
    selectedThemes.includes(question.theme_name)
  );
};

// === UTILITAIRES POUR L'OPTIMISATION DES PERFORMANCES ===

/**
 * Débounce une fonction pour limiter sa fréquence d'exécution
 * Utile pour les champs de recherche, validations, etc.
 * Retarde l'exécution jusqu'à ce qu'il n'y ait plus d'appels pendant 'wait' ms
 * @param func - Fonction à débouncer
 * @param wait - Délai d'attente en millisecondes
 * @returns Fonction débouncée
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    // Annule le timeout précédent
    clearTimeout(timeout);
    // Démarre un nouveau timeout
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle une fonction pour limiter sa fréquence d'exécution
 * Utile pour les événements de scroll, resize, etc.
 * Garantit qu'une fonction ne s'exécute pas plus d'une fois par période
 * @param func - Fonction à throttler
 * @param limit - Période minimale entre les exécutions en millisecondes
 * @returns Fonction throttlée
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      // Exécute immédiatement si pas en période de throttle
      func(...args);
      inThrottle = true;
      // Réactive après la période de limite
      setTimeout(() => inThrottle = false, limit);
    }
  };
};