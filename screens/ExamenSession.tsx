import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  TextStyle
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import Timer from '../components/Timer';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importation des éléments du thème (si disponible)
import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';

// Définition des valeurs par défaut si le système de thèmes n'est pas disponible
const defaultSpacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
};

const defaultBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
};

const defaultTypography = {
  body1: 16,
  button: 16,
};

const defaultColors = {
  primary: '#3099EF',
  text: '#333',
  textLight: '#666',
  background: '#F5F7FA',
  card: '#FFFFFF',
  success: '#4CAF50',
  error: '#F44336',
};

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

interface TouchableButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: string | number;
  iconName?: string;
  borderColor?: string;
  borderWidth?: number;
}

// Composant TouchableButton pour remplacer le composant Button
const TouchableButton: React.FC<TouchableButtonProps> = ({ 
  title, 
  onPress, 
  backgroundColor, 
  textColor, 
  width = '100%', 
  iconName,
  borderColor = 'transparent',
  borderWidth = 0
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor,
          width: width as any,
          borderColor,
          borderWidth
        },
        shadowStyles?.small || {}
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {iconName && (
          <Icon name={iconName} size={24} color={textColor} style={styles.buttonIcon} />
        )}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

type ExamenSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSession'>;

const getRandomElements = <T,>(arr: T[], num: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const ExamenSession: React.FC = () => {
  const navigation = useNavigation<ExamenSessionScreenNavigationProp>();
  const route = useRoute();
  
  // Obtenir le thème brut pour cet écran
  const rawTheme = getThemeForScreen ? getThemeForScreen(route.name) : { primary: '#3099EF' };
  
  // Créer un thème complet avec des valeurs par défaut pour les propriétés manquantes
  const theme = {
    primary: rawTheme.primary || defaultColors.primary,
    background: (rawTheme as any).background || defaultColors.background,
    text: (rawTheme as any).text || defaultColors.text
  };
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allSelectedAnswers, setAllSelectedAnswers] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Session Examen',
      headerStyle: {
        backgroundColor: theme.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    });
  }, [navigation, theme]);

  useEffect(() => {
    const themes: Theme[] = questionsData.themes as Theme[];
    const allQuestions: Question[] = themes.flatMap(theme =>
      theme.questions.map(question => ({
        ...question,
        theme_name: theme.theme_name,
      }))
    );
    const shuffledQuestions = getRandomElements(allQuestions, 45);
    setSelectedQuestions(shuffledQuestions);
    setAllSelectedAnswers(Array(shuffledQuestions.length).fill([]));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isExamFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExamFinished(true);
      finishExam();
    }
  }, [timeLeft, isExamFinished]);

  const finishExam = useCallback(() => {
    const isCorrect = selectedQuestions[currentQuestionIndex]?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      selectedQuestions[currentQuestionIndex]?.correct_answers.includes(answer)
    );
    setScore(prev => prev + (isCorrect ? 1 : 0));

    navigation.navigate('ExamenSessionNote', {
      score: score + (isCorrect ? 1 : 0),
      totalQuestions: selectedQuestions.length,
      selectedQuestions,
      selectedAnswers: allSelectedAnswers,
    });
  }, [currentQuestionIndex, selectedAnswers, selectedQuestions, score, navigation, allSelectedAnswers]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers(prev =>
      prev.includes(answer) ? prev.filter(a => a !== answer) : [...prev, answer]
    );
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedQuestions[currentQuestionIndex]?.correct_answers.every(answer =>
      selectedAnswers.includes(answer)
    ) && selectedAnswers.every(answer =>
      selectedQuestions[currentQuestionIndex]?.correct_answers.includes(answer)
    );

    if (isCorrect) setScore(prev => prev + 1);

    setAllSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = selectedAnswers;
      return newAnswers;
    });

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      finishExam();
    }
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
      </View>
      <Text style={styles.progressText}>
        {currentQuestionIndex + 1}/{selectedQuestions.length}
      </Text>
      <Timer timeLeft={timeLeft} totalTime={45 * 60} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentQuestion && (
          <View style={styles.questionContainerWrapper}>
            <View style={styles.questionContainer}>
              {/* <Text style={styles.themeText}>{currentQuestion.theme_name}</Text> */}
              <Text style={[styles.questionText, { color: theme.text }]}>
                {currentQuestion.question}
              </Text>
              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionButton}>
                  <TouchableButton
                    title={option}
                    onPress={() => handleAnswerSelection(option)}
                    backgroundColor={selectedAnswers.includes(option) ? '#4CAF50' : '#FFFFFF'}
                    textColor={selectedAnswers.includes(option) ? '#FFFFFF' : '#000'}
                    width="100%"
                    borderColor={selectedAnswers.includes(option) ? '#4CAF50' : '#ccc'}
                    borderWidth={1}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <TouchableButton
        title="Suivant"
        onPress={handleNextQuestion}
        backgroundColor={theme.primary}
        textColor="#FFFFFF"
        width="100%"
        iconName="arrow-forward"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: spacing?.m || defaultSpacing.m, 
    justifyContent: 'space-between' 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  questionContainerWrapper: {
    width: '100%',
    // Appliquer l'ombre ici pour éviter les coupures
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  questionContainer: { 
    width: '100%',
    padding: spacing?.m || defaultSpacing.m,
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
    backgroundColor: '#FFFFFF',
  },
  questionText: { 
    fontSize: typography?.body1 || defaultTypography.body1, 
    marginBottom: spacing?.m || defaultSpacing.m, 
    textAlign: 'center',
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  optionButton: { 
    padding: spacing?.xs || defaultSpacing.xs 
  },
  progressBarContainer: { 
    width: '100%', 
    height: 20, 
    backgroundColor: '#e0e0e0', 
    borderRadius: borderRadius?.small || defaultBorderRadius.small, 
    overflow: 'hidden', 
    marginBottom: spacing?.s || 10 
  },
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius?.small || defaultBorderRadius.small
  },
  progressText: { 
    fontSize: typography?.body1 || defaultTypography.body1, 
    marginBottom: spacing?.m || defaultSpacing.m, 
    textAlign: 'center' 
  },
  // Styles pour le bouton
  button: {
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
    paddingVertical: spacing?.m || defaultSpacing.m,
    paddingHorizontal: spacing?.l || defaultSpacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography?.button || defaultTypography.button,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: spacing?.s || defaultSpacing.s,
  },
});

export default ExamenSession;