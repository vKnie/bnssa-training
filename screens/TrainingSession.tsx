import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

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

    // Ajouter un écouteur pour l'événement beforeRemove
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert.alert(
        'Quitter l\'entraînement',
        'Êtes-vous sûr de vouloir quitter l\'entraînement ?',
        [
          { text: 'Non', style: 'cancel', onPress: () => {} },
          {
            text: 'Oui',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return () => unsubscribe();
  }, [navigation, selectedThemes]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers(prevAnswers =>
      prevAnswers.includes(answer)
        ? prevAnswers.filter(a => a !== answer)
        : [...prevAnswers, answer]
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      // Calculer le score pour la question actuelle
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      const isCorrect = currentQuestion.correct_answers.every(answer =>
        selectedAnswers.includes(answer)
      );
      setScore(prevScore => isCorrect ? prevScore + 1 : prevScore);

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]); // Réinitialiser les réponses sélectionnées pour la nouvelle question
    } else {
      // Afficher le score final
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
        {currentQuestion && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {currentQuestion.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  selectedAnswers.includes(option) && styles.selectedOptionButton,
                ]}
                onPress={() => handleAnswerSelection(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
        <Text style={styles.nextButtonText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  questionContainer: { width: '100%' },
  questionText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  optionButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginVertical: 5, width: '100%', alignItems: 'center' },
  selectedOptionButton: { backgroundColor: '#289938', borderColor: '#289938' },
  optionText: { fontSize: 16, textAlign: 'center' },
  nextButton: { padding: 15, backgroundColor: '#3099EF', borderRadius: 5, width: '100%', alignItems: 'center' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16 },
  progressBarContainer: { width: '100%', height: 20, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#3099EF', borderRadius: 5 },
  progressText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});


export default TrainingSession;
