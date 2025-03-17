// TrainingSession.tsx - Mise à jour pour enregistrer les résultats dans SQLite
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
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const initializeDatabase = async () => {
      const db = await dbPromise;
      db.transaction((tx: SQLite.Transaction) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, mode TEXT, score INTEGER, total INTEGER, date TEXT);'
        );
      });
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    const allQuestions = getQuestionsByThemes(selectedThemes);
    const shuffledQuestions = shuffleQuestions(allQuestions);
    setSelectedQuestions(shuffledQuestions.slice(0, 40));
  }, [selectedThemes]);

  const getQuestionsByThemes = (themes: string[]) => {
    return themes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  };

  const shuffleQuestions = (questions: Question[]) => {
    return questions.sort(() => 0.5 - Math.random());
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const isCorrect = selectedQuestions[currentQuestionIndex].correct_answers.every(answer =>
        selectedAnswers.includes(answer)
      );
      setScore(prevScore => (isCorrect ? prevScore + 1 : prevScore));
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
    } else {
      saveResult();
    }
  };

  const saveResult = () => {
    const date = new Date().toISOString();
    dbPromise.then(db => {
      db.transaction((tx: SQLite.Transaction) => {
        tx.executeSql(
          'INSERT INTO history (mode, score, total, date) VALUES (?, ?, ?, ?)',
          ['entrainement', score, selectedQuestions.length, date],
          () => console.log('Résultat enregistré !'),
          (error: any) => {
            console.log(error);
          }
        );
      });
    });
    Alert.alert('Entraînement terminé !', `Votre score est de ${score}/${selectedQuestions.length}`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedQuestions[currentQuestionIndex] && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{selectedQuestions[currentQuestionIndex].question}</Text>
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
