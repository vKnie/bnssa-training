// hooks/index.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { BackHandler } from 'react-native';

import { getThemeForScreen } from '../components/themes';
import { Question } from '../types';
import { isAnswerCorrect } from '../utils';

/**
 * Hook pour gérer le thème de l'écran actuel
 */
export const useScreenTheme = () => {
  const route = useRoute();
  return getThemeForScreen(route.name);
};

/**
 * Hook pour gérer les questions et les réponses
 */
export const useQuestionManager = (initialQuestions: Question[]) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allAnswers, setAllAnswers] = useState<string[][]>([]);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const selectAnswer = useCallback((answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) 
        ? prev.filter(a => a !== answer) 
        : [...prev, answer]
    );
  }, []);

  const nextQuestion = useCallback(() => {
    const isCorrect = currentQuestion ? 
      isAnswerCorrect(selectedAnswers, currentQuestion.correct_answers) : false;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAllAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = selectedAnswers;
      return newAnswers;
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]);
      return false; // Continue
    }
    
    return true; // Finished
  }, [currentQuestion, selectedAnswers, currentIndex, questions.length]);

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

/**
 * Hook pour gérer le timer
 */
export const useTimer = (initialTime: number, onTimeUp?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

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

/**
 * Hook pour gérer la navigation arrière personnalisée
 */
export const useBackHandler = (handler: () => boolean) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => backHandler.remove();
  }, [handler]);
};

/**
 * Hook pour gérer les dimensions d'écran
 */
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState(() => {
    const { Dimensions } = require('react-native');
    return Dimensions.get('window');
  });

  useEffect(() => {
    const { Dimensions } = require('react-native');
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Hook pour gérer l'état de chargement
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

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

/**
 * Hook pour gérer la sélection multiple
 */
export const useMultiSelect = <T>(initialItems: T[] = []) => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialItems);

  const toggleItem = useCallback((item: T) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(items);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selectedItems.includes(item);
  }, [selectedItems]);

  return {
    selectedItems,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount: selectedItems.length,
  };
};