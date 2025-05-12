import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextStyle } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';

// Importation des éléments du thème (si disponible)
import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

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
  heading1: 24,
  heading2: 20,
  body1: 16,
  body2: 14,
};

const defaultColors = {
  primary: '#3099EF',
  text: '#333',
  textLight: '#666',
  background: '#F5F7FA',
  card: '#FFFFFF',
  success: 'green',
  error: 'red',
  neutral: 'gray',
};

type ExamenSessionNoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSessionNote'>;
type ExamenSessionNoteScreenRouteProp = RouteProp<RootStackParamList, 'ExamenSessionNote'>;

const ExamenSessionNote: React.FC = () => {
  const navigation = useNavigation<ExamenSessionNoteScreenNavigationProp>();
  const route = useRoute<ExamenSessionNoteScreenRouteProp>();
  const { score, totalQuestions, selectedQuestions, selectedAnswers } = route.params;
  
  // Obtenir le thème pour cet écran si le système de thèmes est disponible
  const rawTheme = getThemeForScreen ? getThemeForScreen(route.name) : defaultColors;
  
  // Créer un objet thème complet avec des valeurs par défaut pour les propriétés manquantes
  const theme = {
    ...rawTheme,
    card: (rawTheme as any).card || defaultColors.card,
    neutral: (rawTheme as any).neutral || defaultColors.neutral
  };
  
  // Calculer le pourcentage de réussite
  const successPercentage = (score / totalQuestions) * 100;
  
  // Déterminer le statut du score
  const getScoreStatus = () => {
    if (successPercentage >= 75) return { text: 'Excellent!', color: theme.success };
    if (successPercentage >= 50) return { text: 'Satisfaisant', color: '#FFA000' };
    return { text: 'À améliorer', color: theme.error };
  };
  
  const scoreStatus = getScoreStatus();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('ExamenScreen');
    });
    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Récapitulatif Examen',
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

  const handleReturnHome = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerWrapper}>
        <View style={[styles.header, { backgroundColor: '#fff' }]}>
          <Text style={[styles.title, { color: theme.text }]}>Examen terminé !</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: theme.text }]}>
              Votre score est de <Text style={{ fontWeight: 'bold' }}>{score}/{totalQuestions}</Text>
            </Text>
            <Text style={[styles.scoreStatus, { color: scoreStatus.color }]}>
              {scoreStatus.text}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {selectedQuestions.map((question, index) => (
          <View key={index} style={styles.questionContainerWrapper}>
            <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.questionText, { color: theme.text }]}>
                {question.question}
              </Text>
              
              {question.options.map((option, optIndex) => {
                const isCorrect = question.correct_answers.includes(option);
                const isSelected = selectedAnswers[index]?.includes(option);
                
                return (
                  <View key={optIndex} style={styles.answerContainer}>
                    <Icon
                      name={isCorrect ? 'check-circle' : isSelected ? 'times-circle' : 'circle'}
                      size={20}
                      color={isCorrect ? theme.success : 
                            isSelected ? theme.error : 
                            theme.neutral}
                    />
                    <Text 
                      style={[
                        styles.answerText, 
                        { color: theme.text },
                        isSelected && !isCorrect ? [styles.wrongAnswer, { color: theme.error }] : null,
                        isCorrect ? [styles.correctAnswer, { color: theme.success }] : null
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                );
              })}
              
              {selectedAnswers[index]?.length > 0 && (
                <>
                  <Text style={[styles.userAnswerLabel, { color: theme.textLight }]}>
                    Vos réponses :
                  </Text>
                  {selectedAnswers[index]?.map((answer, ansIndex) => (
                    <Text 
                      key={ansIndex} 
                      style={[styles.userAnswerText, { color: theme.textLight }]}
                    >
                      - {answer}
                    </Text>
                  ))}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[
          styles.homeButton, 
          { backgroundColor: theme.primary }
        ]} 
        onPress={handleReturnHome}
        activeOpacity={0.7}
      >
        <Icon name="home" size={20} color="#FFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: spacing?.m || defaultSpacing.m 
  },
  headerWrapper: {
    width: '100%',
    marginBottom: spacing?.l || defaultSpacing.l,
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
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
  header: {
    width: '100%',
    alignItems: 'center',
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
    padding: spacing?.m || defaultSpacing.m,
  },
  title: { 
    fontSize: typography?.heading1 || defaultTypography.heading1, 
    fontWeight: 'bold' as TextStyle['fontWeight'],
    marginBottom: spacing?.s || defaultSpacing.s 
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: { 
    fontSize: typography?.body1 || defaultTypography.body1,
    marginBottom: spacing?.xs || defaultSpacing.xs
  },
  scoreStatus: {
    fontSize: typography?.body1 || defaultTypography.body1,
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: spacing?.l || defaultSpacing.l
  },
  questionContainerWrapper: {
    width: '100%',
    marginBottom: spacing?.m || defaultSpacing.m,
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
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
    fontWeight: 'bold' as TextStyle['fontWeight'], 
    marginBottom: spacing?.m || defaultSpacing.m 
  },
  answerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing?.xs || defaultSpacing.xs 
  },
  answerText: { 
    fontSize: typography?.body2 || defaultTypography.body2, 
    marginLeft: spacing?.s || defaultSpacing.s 
  },
  correctAnswer: { 
    fontWeight: 'bold' as TextStyle['fontWeight']
  },
  wrongAnswer: { 
    textDecorationLine: 'line-through'
  },
  userAnswerLabel: { 
    fontSize: typography?.body2 || defaultTypography.body2, 
    marginTop: spacing?.m || defaultSpacing.m, 
    fontStyle: 'italic'
  },
  userAnswerText: { 
    fontSize: typography?.body2 || defaultTypography.body2, 
    marginLeft: spacing?.s || defaultSpacing.s
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing?.m || defaultSpacing.m,
    borderRadius: borderRadius?.medium || defaultBorderRadius.medium,
    width: '100%',
    marginTop: spacing?.m || defaultSpacing.m,
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography?.body1 || defaultTypography.body1,
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  buttonIcon: {
    marginRight: spacing?.s || defaultSpacing.s,
  },
});

export default ExamenSessionNote;