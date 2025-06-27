// screens/ExamenSession.tsx
import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
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
  getThemeForScreen
} from '../components/themes';
import { RootStackParamList, Question } from '../types';

type ExamenSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSession'>;

const getRandomQuestions = (num: number): Question[] => {
  const allQuestions = questionsData.themes.flatMap(theme =>
    theme.questions.map(question => ({
      ...question,
      theme_name: theme.theme_name,
    }))
  );
  return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, num);
};

const OptionButton: React.FC<{
  option: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ option, isSelected, onPress }) => (
  <View style={styles.optionButton}>
    <TouchableButton
      title={option}
      onPress={onPress}
      backgroundColor={isSelected ? '#4CAF50' : '#FFFFFF'}
      textColor={isSelected ? '#FFFFFF' : '#000'}
      width="100%"
      borderColor={isSelected ? '#4CAF50' : '#ccc'}
      borderWidth={1}
      fontWeight="normal"
    />
  </View>
);

const ExamenSession: React.FC = () => {
  const navigation = useNavigation<ExamenSessionScreenNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const theme = getThemeForScreen(route.name);

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [examStartTime] = useState(() => Date.now());

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;

  const isCorrectAnswer = useCallback(() => {
    if (!currentQuestion) return false;
    return currentQuestion.correct_answers.every(answer => selectedAnswers.includes(answer)) && 
           selectedAnswers.every(answer => currentQuestion.correct_answers.includes(answer));
  }, [currentQuestion, selectedAnswers]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Session Examen' });
  }, [navigation]);

  useEffect(() => {
    const questions = getRandomQuestions(40);
    setSelectedQuestions(questions);
    setAllSelectedAnswers(Array(questions.length).fill([]));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isExamFinished) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExamFinished(true);
      finishExam();
    }
  }, [timeLeft, isExamFinished]);

  const finishExam = useCallback(() => {
    const isCorrect = isCorrectAnswer();
    const finalScore = score + (isCorrect ? 1 : 0);

    const examEndTime = Date.now();
    const examDuration = Math.floor((examEndTime - examStartTime) / 1000);
    const actualDuration = Math.min(examDuration, 45 * 60);

    navigation.navigate('ExamenSessionNote', {
      score: finalScore,
      totalQuestions: selectedQuestions.length,
      selectedQuestions,
      selectedAnswers: [
        ...allSelectedAnswers.slice(0, currentQuestionIndex),
        selectedAnswers,
        ...allSelectedAnswers.slice(currentQuestionIndex + 1)
      ],
      examStartTime,
    });
  }, [isCorrectAnswer, score, navigation, selectedQuestions, allSelectedAnswers, currentQuestionIndex, selectedAnswers, examStartTime]);

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

  if (!currentQuestion) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Préparation de l'examen...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.text }]}>
          {currentQuestionIndex + 1}/{selectedQuestions.length}
        </Text>
        <Timer timeLeft={timeLeft} totalTime={45 * 60} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              isSelected={selectedAnswers.includes(option)}
              onPress={() => handleAnswerSelection(option)}
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
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
    paddingHorizontal: spacing.s,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  progressContainer: { 
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
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  questionContainer: { 
    width: '100%',
    padding: spacing.s,
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
  footer: {
    paddingTop: spacing.m,
  },
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default ExamenSession;