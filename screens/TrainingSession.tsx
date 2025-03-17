import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import questionsData from '../assets/data/questions.json';
import Button from '../components/Button';
import * as SQLite from 'react-native-sqlite-storage';

const dbPromise = SQLite.openDatabase({ name: 'bnssa.db', location: 'default' });

type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

const TrainingSession: React.FC<{ route: TrainingSessionScreenRouteProp }> = ({ route }) => {
  const { selectedThemes } = route.params;
  const navigation = useNavigation();

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const allQuestions = getQuestionsByThemes(selectedThemes);
    const shuffledQuestions = shuffleQuestions(allQuestions);
    setSelectedQuestions(shuffledQuestions.slice(0, 40));

    const unsubscribe = navigation.addListener('beforeRemove', handleBeforeRemove);
    return () => unsubscribe();
  }, [navigation, selectedThemes]);

  const getQuestionsByThemes = (themes: string[]) => {
    return themes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  }, [selectedThemes]);

  const shuffleQuestions = (questions: Question[]) => {
    return questions.sort(() => 0.5 - Math.random());
  };

  const handleBeforeRemove = (e: any) => {
    e.preventDefault();
    Alert.alert(
      'Quitter l\'entraînement',
      'Êtes-vous sûr de vouloir quitter l\'entraînement ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]
    );
  };

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers(prevAnswers =>
      prevAnswers.includes(answer)
        ? prevAnswers.filter(a => a !== answer)
        : [...prevAnswers, answer]
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
        'Questionnaire terminé !',
        `Votre score est de ${score}/${selectedQuestions.length}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / selectedQuestions.length;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {currentQuestionIndex + 1}/{selectedQuestions.length}
      </Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedQuestions[currentQuestionIndex] && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedAnswers.includes(option);
              return (
                <View key={optionIndex} style={styles.optionButton}>
                  <Button
                    title={option}
                    onPress={() => handleAnswerSelection(option)}
                    backgroundColor={isSelected ? '#4CAF50' : 'transparent'}
                    textColor={isSelected ? '#FFFFFF' : '#000'}
                    width="100%"
                    borderColor={isSelected ? 'transparent' : '#ccc'}
                    borderWidth={isSelected ? 0 : 1}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <Button title="Suivant" onPress={handleNextQuestion} backgroundColor="#3099EF" textColor="#FFFFFF" width="100%" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  questionContainer: { width: '100%' },
  questionText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
});

export default TrainingSession;
