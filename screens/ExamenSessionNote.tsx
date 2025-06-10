// screens/ExamenSessionNote.tsx
import React, { useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from '@react-navigation/stack';

import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';
import { RootStackParamList, Question } from '../types';

type ExamenSessionNoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSessionNote'>;
type ExamenSessionNoteScreenRouteProp = RouteProp<RootStackParamList, 'ExamenSessionNote'>;

interface ScoreStatus {
  text: string;
  color: string;
}

interface AnswerItemProps {
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  theme: any;
}

const AnswerItem: React.FC<AnswerItemProps> = React.memo(({ option, isCorrect, isSelected, theme }) => (
  <View style={styles.answerContainer}>
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
));

const ExamenSessionNote: React.FC = () => {
  const navigation = useNavigation<ExamenSessionNoteScreenNavigationProp>();
  const route = useRoute<ExamenSessionNoteScreenRouteProp>();
  const { score, totalQuestions, selectedQuestions, selectedAnswers } = route.params;
  
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  
  const successPercentage = useMemo(() => 
    (score / totalQuestions) * 100, 
    [score, totalQuestions]
  );
  
  const scoreStatus: ScoreStatus = useMemo(() => {
    if (successPercentage >= 75) return { text: 'Excellent!', color: theme.success };
    if (successPercentage >= 50) return { text: 'Satisfaisant', color: '#FFA000' };
    return { text: 'À améliorer', color: theme.error };
  }, [successPercentage, theme]);

  const handleReturnHome = useCallback(() => {
    navigation.navigate('HomeScreen');
  }, [navigation]);

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
    });
  }, [navigation]);

  const QuestionItem = useCallback(({ question, index }: { question: Question; index: number }) => (
    <View key={index} style={styles.questionContainerWrapper}>
      <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.questionText, { color: theme.text }]}>
          {question.question}
        </Text>
        
        {question.options.map((option, optIndex) => {
          const isCorrect = question.correct_answers.includes(option);
          const isSelected = selectedAnswers[index]?.includes(option);
          
          return (
            <AnswerItem
              key={optIndex}
              option={option}
              isCorrect={isCorrect}
              isSelected={isSelected}
              theme={theme}
            />
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
  ), [selectedAnswers, theme]);

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
          <QuestionItem key={index} question={question} index={index} />
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.homeButton, { backgroundColor: theme.primary }]} 
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
    padding: spacing.m 
  },
  headerWrapper: {
    width: '100%',
    marginBottom: spacing.l,
    borderRadius: borderRadius.medium,
    ...shadowStyles.medium,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    padding: spacing.m,
  },
  title: { 
    fontSize: typography.heading1, 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.s 
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: { 
    fontSize: typography.body1,
    marginBottom: spacing.xs
  },
  scoreStatus: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: spacing.l
  },
  questionContainerWrapper: {
    width: '100%',
    marginBottom: spacing.m,
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
  },
  questionContainer: {
    width: '100%',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
  },
  questionText: { 
    fontSize: typography.body1, 
    fontWeight: typography.fontWeightBold, 
    marginBottom: spacing.m 
  },
  answerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing.xs 
  },
  answerText: { 
    fontSize: typography.body2, 
    marginLeft: spacing.s 
  },
  correctAnswer: { 
    fontWeight: typography.fontWeightBold
  },
  wrongAnswer: { 
    textDecorationLine: 'line-through'
  },
  userAnswerLabel: { 
    fontSize: typography.body2, 
    marginTop: spacing.m, 
    fontStyle: 'italic'
  },
  userAnswerText: { 
    fontSize: typography.body2, 
    marginLeft: spacing.s
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    width: '100%',
    marginTop: spacing.m,
    ...shadowStyles.medium,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
});

export default ExamenSessionNote;