import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import Button from '../components/Button';
import Timer from '../components/Timer';
import { RootStackParamList } from '../App';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

type ExamenSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSession'>;

const getRandomElements = <T,>(arr: T[], num: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const ExamenSession: React.FC = () => {
  const navigation = useNavigation<ExamenSessionScreenNavigationProp>();
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Session Examen' });
  }, [navigation]);

  useEffect(() => {
    const themes: Theme[] = questionsData.themes as Theme[];
    const allQuestions: Question[] = themes.flatMap(theme =>
      theme.questions.map(question => ({
        ...question,
        theme_name: theme.theme_name,
      }))
    );
    const shuffledQuestions = getRandomElements(allQuestions, 45);
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
    const isCorrect = selectedQuestions[currentQuestionIndex]?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      selectedQuestions[currentQuestionIndex]?.correct_answers.includes(answer)
    );
    setScore(prev => prev + (isCorrect ? 1 : 0));

    navigation.navigate('ExamenSessionNote', {
      score: score + (isCorrect ? 1 : 0),
      totalQuestions: selectedQuestions.length,
      selectedQuestions,
      selectedAnswers: allSelectedAnswers,
    });
  }, [currentQuestionIndex, selectedAnswers, selectedQuestions, score, navigation, allSelectedAnswers]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) ? prev.filter(a => a !== answer) : [...prev, answer]
    );
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedQuestions[currentQuestionIndex]?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      selectedQuestions[currentQuestionIndex]?.correct_answers.includes(answer)
    );

    if (isCorrect) setScore(prev => prev + 1);

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
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {currentQuestionIndex + 1}/{selectedQuestions.length}
      </Text>
      <Timer timeLeft={timeLeft} totalTime={45 * 60} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentQuestion && (
          <View style={styles.questionContainer}>
            {/* <Text style={styles.themeText}>{currentQuestion.theme_name}</Text> */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, index) => (
              <View key={index} style={styles.optionButton}>
                <Button
                  title={option}
                  onPress={() => handleAnswerSelection(option)}
                  backgroundColor={selectedAnswers.includes(option) ? '#4CAF50' : '#FFFFFF'}
                  textColor={selectedAnswers.includes(option) ? '#FFFFFF' : '#000'}
                  width="100%"
                  borderColor={selectedAnswers.includes(option) ? '#4CAF50' : '#ccc'}
                  borderWidth={1}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Button
        title="Suivant"
        onPress={handleNextQuestion}
        backgroundColor="#3099EF"
        textColor="#FFFFFF"
        width="100%"
        iconName="arrow-forward"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  questionContainer: { width: '100%' },
  questionText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  // themeText: { fontSize: 16, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  optionButton: { padding: 5 },
  progressBarContainer: { width: '100%', height: 20, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#3099EF', borderRadius: 5 },
  progressText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});

export default ExamenSession;
