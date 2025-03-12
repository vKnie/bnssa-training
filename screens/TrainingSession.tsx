import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App'; // Importer le type depuis App.tsx
import questionsData from '../assets/data/questions.json'; // Assurez-vous que le chemin est correct

type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

const TrainingSession: React.FC<{ route: TrainingSessionScreenRouteProp }> = ({ route }) => {
  const { selectedThemes } = route.params;
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Filtrer les questions par thèmes sélectionnés
    const allQuestions = selectedThemes
      .flatMap(themeName =>
        questionsData.themes
          .find(theme => theme.theme_name === themeName)?.questions || []
      );

    // Sélectionner aléatoirement 40 questions
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffledQuestions.slice(0, 40));
  }, [selectedThemes]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Questions sélectionnées :</Text>
      {selectedQuestions.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.options.map((option, optionIndex) => (
            <Text key={optionIndex} style={styles.optionText}>
              - {option}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  questionContainer: { marginVertical: 10 },
  questionText: { fontSize: 16, fontWeight: 'bold' },
  optionText: { fontSize: 14, marginLeft: 10 },
});

export default TrainingSession;
