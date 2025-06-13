// hooks/index.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { BackHandler } from 'react-native';

import { getThemeForScreen } from '../components/themes';
import { Question } from '../types';
import { isAnswerCorrect } from '../utils';

// === HOOKS POUR L'INTERFACE UTILISATEUR ===

/**
 * Hook pour gérer le thème de l'écran actuel
 * Récupère automatiquement le thème approprié selon la route active
 * @returns Objet thème configuré pour l'écran courant
 */
export const useScreenTheme = () => {
  const route = useRoute(); // Récupération de la route courante
  return getThemeForScreen(route.name); // Application du thème selon le nom de la route
};

// === HOOKS POUR LA GESTION DES QUESTIONS ===

/**
 * Hook pour gérer les questions et les réponses dans les sessions d'entraînement/examen
 * Centralise toute la logique de navigation entre questions, sélection des réponses et calcul du score
 * @param initialQuestions - Questions initiales pour la session
 * @returns Objet avec état et fonctions de gestion des questions
 */
export const useQuestionManager = (initialQuestions: Question[]) => {
  // États principaux pour la gestion des questions
  const [questions, setQuestions] = useState<Question[]>(initialQuestions); // Questions de la session
  const [currentIndex, setCurrentIndex] = useState(0); // Index de la question courante
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Réponses sélectionnées pour la question actuelle
  const [allAnswers, setAllAnswers] = useState<string[][]>([]); // Toutes les réponses de toutes les questions
  const [score, setScore] = useState(0); // Score actuel

  // Données calculées dérivées des états
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100; // Pourcentage de progression

  // Fonction pour sélectionner/désélectionner une réponse (gestion multi-sélection)
  const selectAnswer = useCallback((answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) 
        ? prev.filter(a => a !== answer) // Retirer si déjà sélectionné
        : [...prev, answer] // Ajouter si pas encore sélectionné
    );
  }, []);

  // Fonction pour passer à la question suivante avec validation et calcul du score
  const nextQuestion = useCallback(() => {
    // Vérification si la réponse actuelle est correcte
    const isCorrect = currentQuestion ? 
      isAnswerCorrect(selectedAnswers, currentQuestion.correct_answers) : false;

    // Mise à jour du score si correct
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Sauvegarde des réponses de la question actuelle
    setAllAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = selectedAnswers;
      return newAnswers;
    });

    // Passage à la question suivante ou fin de session
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]); // Réinitialisation pour la nouvelle question
      return false; // Continue la session
    }
    
    return true; // Session terminée
  }, [currentQuestion, selectedAnswers, currentIndex, questions.length]);

  // Fonction pour réinitialiser complètement la session
  const resetQuestions = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setAllAnswers([]);
    setScore(0);
  }, []);

  return {
    questions,
    setQuestions,
    currentQuestion,
    currentIndex,
    selectedAnswers,
    allAnswers,
    score,
    progress,
    selectAnswer,
    nextQuestion,
    resetQuestions,
  };
};

// === HOOKS POUR LA GESTION DU TEMPS ===

/**
 * Hook pour gérer un timer décompte avec contrôles start/pause/reset
 * Utilisé pour les examens chronométrés et sessions d'entraînement
 * @param initialTime - Temps initial en secondes
 * @param onTimeUp - Callback optionnel appelé quand le temps expire
 * @returns Objet avec état du timer et fonctions de contrôle
 */
export const useTimer = (initialTime: number, onTimeUp?: () => void) => {
  // États du timer
  const [timeLeft, setTimeLeft] = useState(initialTime); // Temps restant en secondes
  const [isRunning, setIsRunning] = useState(false); // État de fonctionnement du timer
  const intervalRef = useRef<NodeJS.Timeout>(); // Référence pour l'interval

  // Démarrage du timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause du timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Réinitialisation du timer au temps initial
  const reset = useCallback(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  }, [initialTime]);

  // Effet pour gérer le décompte automatique
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Démarrage de l'interval de décompte
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Temps écoulé : arrêt et callback
            setIsRunning(false);
            onTimeUp?.(); // Appel du callback si fourni
            return 0;
          }
          return prev - 1; // Décrément normal
        });
      }, 1000); // Décompte chaque seconde
    } else {
      // Nettoyage de l'interval si timer arrêté
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Nettoyage à la destruction du hook
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onTimeUp]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
  };
};

// === HOOKS POUR LA GESTION DE LA NAVIGATION ===

/**
 * Hook pour gérer la navigation arrière personnalisée (bouton retour Android)
 * Permet d'intercepter le bouton retour physique pour des actions personnalisées
 * @param handler - Fonction appelée lors de l'appui sur retour (return true pour consommer l'événement)
 */
export const useBackHandler = (handler: () => boolean) => {
  useEffect(() => {
    // Enregistrement du listener pour le bouton retour matériel
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
    // Nettoyage du listener au démontage
    return () => backHandler.remove();
  }, [handler]);
};

// === HOOKS POUR LA GESTION DES DIMENSIONS ===

/**
 * Hook pour gérer les dimensions d'écran et détecter les changements d'orientation
 * Utile pour les layouts adaptatifs et responsive design
 * @returns Objet avec width et height de l'écran
 */
export const useScreenDimensions = () => {
  // Initialisation avec les dimensions actuelles
  const [dimensions, setDimensions] = useState(() => {
    const { Dimensions } = require('react-native');
    return Dimensions.get('window');
  });

  useEffect(() => {
    const { Dimensions } = require('react-native');
    
    // Listener pour les changements de dimensions (rotation, etc.)
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    // Nettoyage du listener
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

// === HOOKS POUR LA GESTION DES ÉTATS ===

/**
 * Hook pour gérer l'état de chargement avec fonctions utilitaires
 * Simplifie la gestion des états de loading dans les composants
 * @param initialState - État initial du loading (défaut: false)
 * @returns Objet avec état et fonctions de contrôle du loading
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  // Fonctions optimisées avec useCallback pour éviter les re-renders
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
};

// === HOOKS POUR LA SÉLECTION MULTIPLE ===

/**
 * Hook pour gérer la sélection multiple d'éléments
 * Utilisé pour la sélection de thèmes, questions, etc.
 * @param initialItems - Éléments initialement sélectionnés
 * @returns Objet avec état de sélection et fonctions de gestion
 */
export const useMultiSelect = <T>(initialItems: T[] = []) => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialItems);

  // Basculer la sélection d'un élément (ajouter/retirer)
  const toggleItem = useCallback((item: T) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item) // Retirer si sélectionné
        : [...prev, item] // Ajouter si pas sélectionné
    );
  }, []);

  // Sélectionner tous les éléments fournis
  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(items);
  }, []);

  // Vider la sélection
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Vérifier si un élément est sélectionné
  const isSelected = useCallback((item: T) => {
    return selectedItems.includes(item);
  }, [selectedItems]);

  return {
    selectedItems,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount: selectedItems.length, // Nombre d'éléments sélectionnés
  };
};