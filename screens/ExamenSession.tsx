// screens/ExamenSession.tsx
import React, { useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import questionsData from '../assets/data/questions.json';
import Timer from '../components/Timer';
import TouchableButton from '../components/TouchableButton';
import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';
import { RootStackParamList, Question, Theme } from '../types';

type ExamenSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSession'>;

const getRandomElements = <T,>(arr: T[], num: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const ExamenSession: React.FC = () => {
  const navigation = useNavigation<ExamenSessionScreenNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);

  const currentQuestion = useMemo(() => 
    selectedQuestions[currentQuestionIndex], 
    [selectedQuestions, currentQuestionIndex]
  );

  const progress = useMemo(() => 
    ((currentQuestionIndex + 1) / selectedQuestions.length) * 100, 
    [currentQuestionIndex, selectedQuestions.length]
  );

  const isCorrectAnswer = useCallback(() => {
    return currentQuestion?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      currentQuestion?.correct_answers.includes(answer)
    );
  }, [currentQuestion, selectedAnswers]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Session Examen',
    });
  }, [navigation]);

  useEffect(() => {
    const themes: Theme[] = questionsData.themes as Theme[];
    const allQuestions: Question[] = themes.flatMap(theme =>
      theme.questions.map(question => ({
        ...question,
        theme_name: theme.theme_name,
      }))
    );
    const shuffledQuestions = getRandomElements(allQuestions, 40);
    setSelectedQuestions(shuffledQuestions);
    setAllSelectedAnswers(Array(shuffledQuestions.length).fill([]));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isExamFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExamFinished(true);
      finishExam();
    }
  }, [timeLeft, isExamFinished]);

  const finishExam = useCallback(() => {
    const isCorrect = isCorrectAnswer();
    const finalScore = score + (isCorrect ? 1 : 0);

    navigation.navigate('ExamenSessionNote', {
      score: finalScore,
      totalQuestions: selectedQuestions.length,
      selectedQuestions,
      selectedAnswers: [
        ...allSelectedAnswers.slice(0, currentQuestionIndex),
        selectedAnswers,
        ...allSelectedAnswers.slice(currentQuestionIndex + 1)
      ],
    });
  }, [isCorrectAnswer, score, navigation, selectedQuestions, allSelectedAnswers, currentQuestionIndex, selectedAnswers]);

  const handleAnswerSelection = useCallback((answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) 
        ? prev.filter(a => a !== answer) 
        : [...prev, answer]
    );
  }, []);

  const handleNextQuestion = useCallback(() => {
    const isCorrect = isCorrectAnswer();

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAllSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = selectedAnswers;
      return newAnswers;
    });

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      finishExam();
    }
  }, [isCorrectAnswer, currentQuestionIndex, selectedQuestions.length, selectedAnswers, finishExam]);

  const OptionButton = useCallback(({ option, index }: { option: string; index: number }) => {
    const isSelected = selectedAnswers.includes(option);
    
    return (
      <View key={index} style={styles.optionButton}>
        <TouchableButton
          title={option}
          onPress={() => handleAnswerSelection(option)}
          backgroundColor={isSelected ? '#4CAF50' : '#FFFFFF'}
          textColor={isSelected ? '#FFFFFF' : '#000'}
          width="100%"
          borderColor={isSelected ? '#4CAF50' : '#ccc'}
          borderWidth={1}
          fontWeight="normal"
        />
      </View>
    );
  }, [selectedAnswers, handleAnswerSelection]);

  if (!currentQuestion) {
    return (
      <View style={[
        styles.container, 
        { 
          backgroundColor: theme.background, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingBottom: insets.bottom + spacing.m
        }
      ]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Préparation de l'examen...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* En-tête avec barre de progression */}
      <View style={styles.headerContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.text }]}>
          {currentQuestionIndex + 1}/{selectedQuestions.length}
        </Text>
        <Timer timeLeft={timeLeft} totalTime={45 * 60} />
      </View>
      
      {/* Contenu principal avec ScrollView */}
      <ScrollView 
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainerWrapper}>
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentQuestion.question}
            </Text>
            {currentQuestion.options.map((option, index) => (
              <OptionButton key={index} option={option} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Pied de page avec bouton fixe et marge pour la barre de navigation */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + spacing.m }]}>
        <TouchableButton
          title="Suivant"
          onPress={handleNextQuestion}
          backgroundColor={theme.primary}
          textColor="#FFFFFF"
          width="100%"
          iconName="arrow-forward"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  headerContainer: {
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContainer: { 
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  questionContainerWrapper: {
    width: '100%',
  },
  questionContainer: { 
    width: '100%',
    padding: spacing.m,
  },
  questionText: { 
    fontSize: typography.body1, 
    marginBottom: spacing.m, 
    textAlign: 'center',
    fontWeight: typography.fontWeightBold,
  },
  optionButton: { 
    marginBottom: spacing.xs,
  },
  progressBarContainer: { 
    width: '100%', 
    height: 20, 
    backgroundColor: '#e0e0e0', 
    borderRadius: borderRadius.small, 
    overflow: 'hidden', 
    marginBottom: spacing.s,
  },
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius.small
  },
  progressText: { 
    fontSize: typography.body1, 
    textAlign: 'center',
    fontWeight: typography.fontWeightMedium,
  },
  footerContainer: {
    paddingTop: spacing.m,
  },
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default ExamenSession;