import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import Button from '../components/Button';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

const getRandomElements = <T,>(arr: T[], num: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const ExamenSession: React.FC = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Session Examen' });
  }, [navigation]);

  useEffect(() => {
    const themes: Theme[] = questionsData.themes;
    let allQuestions: Question[] = themes.flatMap(theme => theme.questions);
    const shuffledQuestions = getRandomElements(allQuestions, 40);
    setSelectedQuestions(shuffledQuestions);
  }, []);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) ? prev.filter(a => a !== answer) : [...prev, answer]
    );
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedQuestions[currentQuestionIndex]?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    );
    
    if (isCorrect) setScore(prev => prev + 1);

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      Alert.alert(
        'Examen terminé !',
        `Votre score est de ${score + (isCorrect ? 1 : 0)}/${selectedQuestions.length}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentQuestion && (
          <View style={styles.questionContainer}>
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
                  borderWidth={selectedAnswers.includes(option) ? 1 : 1}
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
  optionButton: { padding: 5 },
  progressBarContainer: { width: '100%', height: 20, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#3099EF', borderRadius: 5 },
  progressText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});

export default ExamenSession;