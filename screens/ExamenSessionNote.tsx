import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

interface ExamenSessionNoteProps {
  score: number;
  totalQuestions: number;
  selectedQuestions: Question[];
  selectedAnswers: string[][];
}

const ExamenSessionNote: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { score, totalQuestions, selectedQuestions, selectedAnswers } = route.params as ExamenSessionNoteProps;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('ExamenScreen');
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Examen terminé !</Text>
      <Text style={styles.scoreText}>Votre score est de {score}/{totalQuestions}</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {selectedQuestions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.options.map((option, optIndex) => {
              const isCorrect = question.correct_answers.includes(option);
              const isSelected = selectedAnswers[index].includes(option);
              return (
                <View key={optIndex} style={styles.answerContainer}>
                  <Icon
                    name={isCorrect ? 'check-circle' : isSelected ? 'times-circle' : 'circle'}
                    size={20}
                    color={isCorrect ? 'green' : isSelected ? 'red' : 'gray'}
                  />
                  <Text style={[styles.answerText, isSelected && !isCorrect ? styles.wrongAnswer : null, isCorrect ? styles.correctAnswer : null]}>
                    {option}
                  </Text>
                </View>
              );
            })}
            <Text style={styles.userAnswerText}>Vos réponses : {selectedAnswers[index].join(', ')}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  scoreText: { fontSize: 18, marginBottom: 20 },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingRight: 10 },
  questionContainer: {
    width: '98%',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  questionText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  answerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  answerText: { fontSize: 16, marginLeft: 10 },
  correctAnswer: { color: 'green' },
  wrongAnswer: { textDecorationLine: 'line-through', color: 'red' },
  userAnswerText: { fontSize: 16, marginTop: 10, fontStyle: 'italic', color: 'gray' },
});

export default ExamenSessionNote;
