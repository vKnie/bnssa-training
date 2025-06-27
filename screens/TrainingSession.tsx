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
import Icon from 'react-native-vector-icons/MaterialIcons';
import questionsData from '../assets/data/questions.json';
import { 
  typography, 
  spacing, 
  borderRadius,
  getThemeForScreen
} from '../components/themes';
import TouchableButton from '../components/TouchableButton';
import { RootStackParamList, Question } from '../types';

type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

const TrainingSession: React.FC = () => {
  const route = useRoute<TrainingSessionScreenRouteProp>();
  const { selectedThemes, instantAnswerMode = false } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const allQuestions = useMemo(() => {
    return selectedThemes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  }, [selectedThemes]);

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;

  const isCorrectAnswer = useCallback(() => {
    if (!currentQuestion) return false;
    return currentQuestion.correct_answers.every(answer => selectedAnswers.includes(answer)) && 
           selectedAnswers.every(answer => currentQuestion.correct_answers.includes(answer));
  }, [currentQuestion, selectedAnswers]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: `Session d'entrainement${instantAnswerMode ? ' (Mode instantané)' : ''}`,
    });
  }, [navigation, instantAnswerMode]);

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
    if (showAnswers) return;
    
    setSelectedAnswers(prev => 
      prev.includes(answer) 
        ? prev.filter(a => a !== answer)
        : [...prev, answer]
    );
  }, [showAnswers]);

  const handleValidateAnswers = useCallback(() => {
    if (instantAnswerMode && !showAnswers) {
      setTimeout(() => setShowAnswers(true), 300);
    }
  }, [instantAnswerMode, showAnswers]);

  const handleNextQuestion = useCallback(() => {
    const isCorrect = isCorrectAnswer();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setShowAnswers(false);
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

  const getOptionStyle = useCallback((option: string) => {
    const isSelected = selectedAnswers.includes(option);
    const isCorrect = currentQuestion?.correct_answers.includes(option);
    
    if (showAnswers && instantAnswerMode) {
      if (isCorrect) {
        return { bg: theme.success, border: theme.success, text: '#FFFFFF' };
      } else if (isSelected && !isCorrect) {
        return { bg: theme.error, border: theme.error, text: '#FFFFFF' };
      }
      return { bg: theme.card, border: '#ccc', text: theme.text };
    }
    
    return {
      bg: isSelected ? theme.success : theme.card,
      border: isSelected ? theme.success : '#ccc',
      text: isSelected ? '#FFFFFF' : theme.text
    };
  }, [selectedAnswers, currentQuestion, showAnswers, instantAnswerMode, theme]);

  const OptionButton = useCallback(({ option, index }: { option: string; index: number }) => {
    const style = getOptionStyle(option);
    const isCorrect = currentQuestion?.correct_answers.includes(option);
    const isSelected = selectedAnswers.includes(option);
    
    return (
      <View key={index} style={styles.optionButton}>
        <View style={styles.optionContainer}>
          <TouchableButton
            title={option}
            onPress={() => handleAnswerSelection(option)}
            backgroundColor={style.bg}
            textColor={style.text}
            width="100%"
            borderColor={style.border}
            borderWidth={1}
            fontWeight="normal"
            disabled={showAnswers}
          />
          {showAnswers && instantAnswerMode && (
            <View style={styles.resultIcon}>
              {isCorrect ? (
                <Icon name="check-circle" size={24} color={theme.success} />
              ) : (
                isSelected && <Icon name="cancel" size={24} color={theme.error} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  }, [selectedAnswers, handleAnswerSelection, getOptionStyle, showAnswers, instantAnswerMode, currentQuestion, theme]);

  const renderFeedback = () => {
    if (!showAnswers || !instantAnswerMode) return null;
    
    const isCorrect = isCorrectAnswer();
    
    return (
      <View style={[
        styles.feedback, 
        { 
          backgroundColor: isCorrect ? `${theme.success}20` : `${theme.error}20`,
          borderColor: isCorrect ? theme.success : theme.error
        }
      ]}>
        <Icon 
          name={isCorrect ? "check-circle" : "cancel"} 
          size={24} 
          color={isCorrect ? theme.success : theme.error} 
        />
        <Text style={[styles.feedbackText, { color: isCorrect ? theme.success : theme.error }]}>
          {isCorrect ? "Bonne réponse !" : "Réponse incorrecte"}
        </Text>
      </View>
    );
  };

  if (!currentQuestion) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Chargement...</Text>
      </View>
    );
  }

  const canProceed = selectedAnswers.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.progressText, { color: theme.text }]}>
            {currentQuestionIndex + 1}/{selectedQuestions.length}
          </Text>
          {instantAnswerMode && (
            <View style={styles.modeIndicator}>
              <Icon name="flash-on" size={16} color={theme.primary} />
              <Text style={[styles.modeText, { color: theme.primary }]}>Mode instantané</Text>
            </View>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>
          
          {currentQuestion.options.map((option, index) => (
            <OptionButton key={index} option={option} index={index} />
          ))}
          
          {renderFeedback()}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
        {instantAnswerMode && !showAnswers ? (
          <TouchableButton
            title="Valider mes réponses"
            onPress={handleValidateAnswers}
            backgroundColor={canProceed ? theme.primary : '#ccc'}
            textColor={canProceed ? "#FFFFFF" : '#999'}
            width="100%"
            iconName="check"
            disabled={!canProceed}
          />
        ) : (
          <TouchableButton
            title={instantAnswerMode && showAnswers ? "Question suivante" : "Suivant"}
            onPress={handleNextQuestion}
            backgroundColor={canProceed ? theme.primary : '#ccc'}
            textColor={canProceed ? "#FFFFFF" : '#999'}
            width="100%"
            iconName="arrow-forward"
            disabled={!canProceed}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: spacing.s,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.l,
    paddingBottom: spacing.m,
  },
  progressContainer: { 
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: { 
    fontSize: typography.body1, 
    fontWeight: typography.fontWeightMedium,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.xs / 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.m,
  },
  questionContainer: { 
    width: '100%',
    padding: spacing.s,
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
  optionContainer: {
    position: 'relative',
    width: '100%',
  },
  resultIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.s,
  },
  footer: {
    paddingTop: spacing.m,
  },
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default TrainingSession;