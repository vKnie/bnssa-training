// screens/TrainingSession.tsx
import React, { useEffect, useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import questionsData from '../assets/data/questions.json';
import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';
import TouchableButton from '../components/TouchableButton';
import { RootStackParamList, Question } from '../types';

type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

const TrainingSession: React.FC = () => {
  const route = useRoute<TrainingSessionScreenRouteProp>();
  const { selectedThemes } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const allQuestions = useMemo(() => {
    return selectedThemes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  }, [selectedThemes]);

  const currentQuestion = useMemo(() => 
    selectedQuestions[currentQuestionIndex], 
    [selectedQuestions, currentQuestionIndex]
  );

  const progress = useMemo(() => 
    ((currentQuestionIndex + 1) / selectedQuestions.length) * 100, 
    [currentQuestionIndex, selectedQuestions.length]
  );

  const isCorrectAnswer = useCallback(() => {
    return currentQuestion?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      currentQuestion?.correct_answers.includes(answer)
    );
  }, [currentQuestion, selectedAnswers]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Session d\'entrainement',
    });
  }, [navigation]);

  useEffect(() => {
    const shuffledQuestions = [...allQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 40);
    setSelectedQuestions(shuffledQuestions);

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      Alert.alert(
        'Quitter l\'entraînement',
        'Êtes-vous sûr de vouloir quitter l\'entraînement ?',
        [
          { text: 'Non', style: 'cancel' },
          { text: 'Oui', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, allQuestions]);

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

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      const successRate = (finalScore / selectedQuestions.length) * 100;
      
      let message = `Votre score est de ${finalScore}/${selectedQuestions.length}`;
      if (successRate >= 80) {
        message += "\n\nExcellent travail ! Continuez comme ça !";
      } else if (successRate >= 60) {
        message += "\n\nBon travail ! Continuez à vous entraîner.";
      } else {
        message += "\n\nContinuez à vous entraîner pour améliorer vos résultats.";
      }
      
      Alert.alert(
        'Questionnaire terminé !',
        message,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isCorrectAnswer, currentQuestionIndex, selectedQuestions.length, score, navigation]);

  const OptionButton = useCallback(({ option, index }: { option: string; index: number }) => {
    const isSelected = selectedAnswers.includes(option);
    
    return (
      <View key={index} style={styles.optionButton}>
        <TouchableButton
          title={option}
          onPress={() => handleAnswerSelection(option)}
          backgroundColor={isSelected ? theme.success : theme.card}
          textColor={isSelected ? '#FFFFFF' : theme.text}
          width="100%"
          borderColor={isSelected ? theme.success : '#ccc'}
          borderWidth={1}
          fontWeight="normal"
        />
      </View>
    );
  }, [selectedAnswers, handleAnswerSelection, theme]);

  if (!currentQuestion) {
    return (
      <View style={[
        styles.container, 
        { 
          backgroundColor: theme.background, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingBottom: insets.bottom + spacing.m
        }
      ]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* En-tête avec barre de progression */}
      <View style={styles.headerContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.text }]}>
          {currentQuestionIndex + 1}/{selectedQuestions.length}
        </Text>
      </View>
      
      {/* Contenu principal avec ScrollView */}
      <ScrollView 
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainerWrapper}>
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentQuestion.question}
            </Text>
            
            {currentQuestion.options.map((option, index) => (
              <OptionButton key={index} option={option} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Pied de page avec bouton fixe et marge pour la barre de navigation */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + spacing.m }]}>
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
    paddingHorizontal: spacing.m,
  },
  headerContainer: {
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContainer: { 
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  questionContainerWrapper: {
    width: '100%',
  },
  questionContainer: { 
    width: '100%',
    padding: spacing.m,
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
  progressBarContainer: { 
    width: '100%', 
    height: 20, 
    backgroundColor: '#e0e0e0', 
    borderRadius: borderRadius.small, 
    overflow: 'hidden', 
    marginBottom: spacing.s,
  },
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius.small,
  },
  progressText: { 
    fontSize: typography.body1, 
    textAlign: 'center',
    fontWeight: typography.fontWeightMedium,
  },
  footerContainer: {
    paddingTop: spacing.m,
  },
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default TrainingSession;