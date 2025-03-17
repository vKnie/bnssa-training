import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';

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
  const [selectedQuestions, setSelectedQuestions] = useState<{ theme: string; question: Question }[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: 'Session Examen' });
    
    // Récupération de tous les thèmes
    const themes: Theme[] = questionsData.themes;
    let mixedQuestions: { theme: string; question: Question }[] = [];

    // Sélection de 40 questions en prenant un thème aléatoire pour chaque question
    for (let i = 0; i < 40; i++) {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const randomQuestion = getRandomElements(randomTheme.questions, 1)[0];
      mixedQuestions.push({ theme: randomTheme.theme_name, question: randomQuestion });
    }

    setSelectedQuestions(mixedQuestions);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session d'Examen</Text>
      <FlatList
        data={selectedQuestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.questionContainer}>
            <Text style={styles.theme}>Thème: {item.theme}</Text>
            <Text style={styles.question}>{item.question.question}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  questionContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  theme: { fontSize: 14, fontWeight: 'bold', color: '#777', marginBottom: 5 },
  question: { fontSize: 16, color: '#333' },
});

export default ExamenSession;