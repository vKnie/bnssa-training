import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Platform,
  TextStyle
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import questionsData from '../assets/data/questions.json';
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

type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

// Interface pour le bouton
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

const TrainingSession: React.FC = () => {
  const route = useRoute<TrainingSessionScreenRouteProp>();
  const { selectedThemes } = route.params;
  const navigation = useNavigation();
  
  // Obtenir le thème pour cet écran si le système de thèmes est disponible
  const rawTheme = getThemeForScreen ? getThemeForScreen(route.name) : defaultColors;
  
  // Créer un objet thème complet avec des valeurs par défaut pour les propriétés manquantes
  const theme = {
    ...rawTheme,
    card: (rawTheme as any).card || defaultColors.card,
    success: rawTheme.success || defaultColors.success,
    error: rawTheme.error || defaultColors.error
  };

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  // Définir le titre de la page
  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Session d\'entrainement',
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

  // Sélectionner et mélanger les questions
  const allQuestions = useMemo(() => {
    return selectedThemes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  }, [selectedThemes]);

  useEffect(() => {
    const shuffledQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 40);
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

    return () => unsubscribe();
  }, [navigation, allQuestions]);

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

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      const successRate = (finalScore / selectedQuestions.length) * 100;
      
      // Définir un message en fonction du taux de réussite
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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion && (
          <View style={styles.questionContainerWrapper}>
            <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.questionText, { color: theme.text }]}>
                {currentQuestion.question}
              </Text>
              
              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionButton}>
                  <TouchableButton
                    title={option}
                    onPress={() => handleAnswerSelection(option)}
                    backgroundColor={selectedAnswers.includes(option) ? 
                      theme.success : 
                      theme.card}
                    textColor={selectedAnswers.includes(option) ? '#FFFFFF' : theme.text}
                    width="100%"
                    borderColor={selectedAnswers.includes(option) ? 
                      theme.success : 
                      '#ccc'}
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
    alignItems: 'center',
    paddingVertical: spacing?.m || defaultSpacing.m
  },
  questionContainerWrapper: {
    width: '100%',
    // Appliquer l'ombre ici plutôt que sur questionContainer directement
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
    marginBottom: spacing?.s || defaultSpacing.s,
  },
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius?.small || defaultBorderRadius.small,
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
        elevation: 2,
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

export default TrainingSession;