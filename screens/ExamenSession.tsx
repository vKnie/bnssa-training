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

// Type pour la navigation de l'écran de session d'examen
type ExamenSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSession'>;

// Fonction utilitaire pour sélectionner aléatoirement un nombre spécifique de questions
const getRandomQuestions = (num: number): Question[] => {
  // Aplatissement de toutes les questions de tous les thèmes
  const allQuestions = questionsData.themes.flatMap(theme =>
    theme.questions.map(question => ({
      ...question,
      theme_name: theme.theme_name, // Ajout du nom du thème à chaque question
    }))
  );
  // Mélange aléatoire et sélection des premières 'num' questions
  return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, num);
};

// Composant pour afficher chaque option de réponse
const OptionButton: React.FC<{
  option: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ option, isSelected, onPress }) => (
  <View style={styles.optionButton}>
    <TouchableButton
      title={option}
      onPress={onPress}
      // Couleurs dynamiques selon l'état de sélection
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
  const insets = useSafeAreaInsets(); // Pour gérer les zones sécurisées (notch, etc.)
  const theme = getThemeForScreen(route.name);

  // États principaux de l'examen
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]); // Questions sélectionnées pour l'examen
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index de la question actuelle
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Réponses sélectionnées pour la question courante
  const [allSelectedAnswers, setAllSelectedAnswers] = useState<string[][]>([]); // Toutes les réponses de toutes les questions
  const [score, setScore] = useState(0); // Score actuel de l'utilisateur
  const [timeLeft, setTimeLeft] = useState(45 * 60); // Temps restant en secondes (45 minutes)
  const [isExamFinished, setIsExamFinished] = useState(false); // État de fin d'examen

  // Données calculées dérivées des états
  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100; // Pourcentage de progression

  // Fonction pour vérifier si les réponses sélectionnées sont correctes
  const isCorrectAnswer = useCallback(() => {
    if (!currentQuestion) return false;
    // Vérification bidirectionnelle : toutes les bonnes réponses sont sélectionnées ET aucune mauvaise réponse n'est sélectionnée
    return currentQuestion.correct_answers.every(answer => selectedAnswers.includes(answer)) && 
           selectedAnswers.every(answer => currentQuestion.correct_answers.includes(answer));
  }, [currentQuestion, selectedAnswers]);

  // Configuration du titre de l'écran
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Session Examen' });
  }, [navigation]);

  // Initialisation des questions au montage du composant
  useEffect(() => {
    const questions = getRandomQuestions(40); // Sélection de 40 questions aléatoires
    setSelectedQuestions(questions);
    setAllSelectedAnswers(Array(questions.length).fill([])); // Initialisation du tableau des réponses
  }, []);

  // Gestion du timer - décompte automatique
  useEffect(() => {
    if (timeLeft > 0 && !isExamFinished) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer); // Nettoyage du timer
    } else if (timeLeft === 0) {
      // Fin automatique de l'examen quand le temps expire
      setIsExamFinished(true);
      finishExam();
    }
  }, [timeLeft, isExamFinished]);

  // Fonction pour terminer l'examen et naviguer vers l'écran de résultats
  const finishExam = useCallback(() => {
    const isCorrect = isCorrectAnswer();
    const finalScore = score + (isCorrect ? 1 : 0); // Ajout du point pour la dernière question si correcte

    // Navigation vers l'écran de notation avec toutes les données nécessaires
    navigation.navigate('ExamenSessionNote', {
      score: finalScore,
      totalQuestions: selectedQuestions.length,
      selectedQuestions,
      selectedAnswers: [
        ...allSelectedAnswers.slice(0, currentQuestionIndex), // Réponses des questions précédentes
        selectedAnswers, // Réponses de la question actuelle
        ...allSelectedAnswers.slice(currentQuestionIndex + 1) // Réponses des questions suivantes (vides)
      ],
    });
  }, [isCorrectAnswer, score, navigation, selectedQuestions, allSelectedAnswers, currentQuestionIndex, selectedAnswers]);

  // Gestionnaire de sélection/désélection des réponses
  const handleAnswerSelection = useCallback((answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) 
        ? prev.filter(a => a !== answer) // Désélectionner si déjà sélectionné
        : [...prev, answer] // Ajouter à la sélection
    );
  }, []);

  // Gestionnaire de passage à la question suivante
  const handleNextQuestion = useCallback(() => {
    const isCorrect = isCorrectAnswer();

    // Mise à jour du score si la réponse est correcte
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Sauvegarde des réponses de la question actuelle
    setAllSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = selectedAnswers;
      return newAnswers;
    });

    // Passage à la question suivante ou fin de l'examen
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]); // Réinitialisation des réponses pour la nouvelle question
    } else {
      finishExam(); // Fin de l'examen si c'était la dernière question
    }
  }, [isCorrectAnswer, currentQuestionIndex, selectedQuestions.length, selectedAnswers, finishExam]);

  // Écran de chargement pendant la préparation des questions
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
      {/* Section d'en-tête avec barre de progression, compteur et timer */}
      <View style={styles.header}>
        {/* Barre de progression visuelle */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        {/* Compteur de questions */}
        <Text style={[styles.progressText, { color: theme.text }]}>
          {currentQuestionIndex + 1}/{selectedQuestions.length}
        </Text>
        {/* Composant Timer */}
        <Timer timeLeft={timeLeft} totalTime={45 * 60} />
      </View>
      
      {/* Zone de contenu scrollable avec la question et les options */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          {/* Texte de la question */}
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>
          {/* Mapping des options de réponse */}
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
      
      {/* Pied de page avec bouton de navigation */}
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
  // Conteneur principal - prend toute la hauteur avec padding horizontal
  container: { 
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  // Style pour l'état de chargement - centré
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // En-tête avec padding vertical
  header: {
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  // Conteneur de la barre de progression
  progressContainer: { 
    width: '100%', 
    height: 20, 
    backgroundColor: '#e0e0e0', 
    borderRadius: borderRadius.small, 
    overflow: 'hidden', // Pour les coins arrondis de la barre
    marginBottom: spacing.s,
  },
  // Barre de progression animée
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius.small
  },
  // Texte du compteur de progression
  progressText: { 
    fontSize: typography.body1, 
    textAlign: 'center',
    fontWeight: typography.fontWeightMedium,
  },
  // ScrollView principal
  scrollView: {
    flex: 1,
  },
  // Contenu du scroll - centré verticalement
  scrollContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  // Conteneur de la question et des options
  questionContainer: { 
    width: '100%',
    padding: spacing.m,
  },
  // Style du texte de la question
  questionText: { 
    fontSize: typography.body1, 
    marginBottom: spacing.m, 
    textAlign: 'center',
    fontWeight: typography.fontWeightBold,
  },
  // Wrapper de chaque bouton d'option
  optionButton: { 
    marginBottom: spacing.xs,
  },
  // Pied de page avec padding adaptatif selon la zone sécurisée
  footer: {
    paddingTop: spacing.m,
  },
  // Texte de chargement
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default ExamenSession;