// screens/ExamenSessionNote.tsx
import React, { useEffect, useLayoutEffect, useCallback, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  typography, 
  spacing, 
  borderRadius,
  shadowStyles,
  getThemeForScreen
} from '../components/themes';
import { RootStackParamList, Question } from '../types';
import { databaseService } from '../services/DatabaseService';

type ExamenSessionNoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSessionNote'>;
type ExamenSessionNoteScreenRouteProp = RouteProp<RootStackParamList, 'ExamenSessionNote'>;
type TabType = 'all' | 'correct' | 'incorrect' | 'unanswered';

const AnswerItem: React.FC<{
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  theme: any;
}> = ({ option, isCorrect, isSelected, theme }) => (
  <View style={styles.answerContainer}>
    <Icon
      name={isCorrect ? 'check-circle' : isSelected ? 'times-circle' : 'circle'}
      size={20}
      color={isCorrect ? theme.success : isSelected ? theme.error : theme.neutral}
    />
    <Text 
      style={[
        styles.answerText, 
        { color: theme.text },
        isSelected && !isCorrect && [styles.wrongAnswer, { color: theme.error }],
        isCorrect && [styles.correctAnswer, { color: theme.success }]
      ]}
    >
      {option}
    </Text>
  </View>
);

const QuestionItem: React.FC<{
  question: Question;
  index: number;
  selectedAnswers: string[][];
  theme: any;
}> = ({ question, index, selectedAnswers, theme }) => (
  <View style={styles.questionWrapper}>
    <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.questionText, { color: theme.text }]}>
        Question {index + 1}: {question.question}
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
      
      {selectedAnswers[index]?.length > 0 ? (
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
      ) : (
        <Text style={[styles.noAnswerText, { color: theme.error }]}>
          Aucune réponse fournie
        </Text>
      )}
    </View>
  </View>
);

const FilterChip: React.FC<{
  title: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  color: string;
}> = ({ title, count, isActive, onPress, color }) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      { 
        backgroundColor: isActive ? color : '#FFFFFF',
        borderColor: isActive ? color : '#E5E7EB',
        shadowColor: isActive ? color : '#000',
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.chipText,
      { color: isActive ? '#FFFFFF' : '#6B7280' }
    ]}>
      {title}
    </Text>
    <View style={[
      styles.chipBadge,
      { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F3F4F6' }
    ]}>
      <Text style={[
        styles.chipBadgeText,
        { color: isActive ? '#FFFFFF' : '#374151' }
      ]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

const ExamenSessionNote: React.FC = () => {
  const navigation = useNavigation<ExamenSessionNoteScreenNavigationProp>();
  const route = useRoute<ExamenSessionNoteScreenRouteProp>();
  
  const { 
    score, 
    totalQuestions, 
    selectedQuestions, 
    selectedAnswers,
    examDuration,
    examStartTime
  } = route.params;
  
  const insets = useSafeAreaInsets();
  const theme = getThemeForScreen(route.name);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [saveStatus, setSaveStatus] = useState<'pending' | 'saving' | 'saved' | 'error'>('pending');
  const saveAttemptRef = useRef(false);
  
  const successPercentage = (score / totalQuestions) * 100;
  
  const getScoreStatus = () => {
    if (successPercentage >= 75) return { text: 'Excellent!', color: theme.success };
    if (successPercentage >= 50) return { text: 'Satisfaisant', color: '#FFA000' };
    return { text: 'À améliorer', color: theme.error };
  };

  const scoreStatus = getScoreStatus();

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const questionCategories = useMemo(() => {
    const correct: number[] = [];
    const incorrect: number[] = [];
    const unanswered: number[] = [];

    selectedQuestions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      
      if (userAnswers.length === 0) {
        unanswered.push(index);
      } else {
        const isCorrect = question.correct_answers.every(answer => userAnswers.includes(answer)) && 
                         userAnswers.every(answer => question.correct_answers.includes(answer));
        
        if (isCorrect) {
          correct.push(index);
        } else {
          incorrect.push(index);
        }
      }
    });

    return { correct, incorrect, unanswered };
  }, [selectedQuestions, selectedAnswers]);

  const filteredQuestions = useMemo(() => {
    if (activeTab === 'all') {
      return selectedQuestions.map((question, index) => ({ question, index }));
    }
    
    const indices = questionCategories[activeTab];
    return indices.map(index => ({ question: selectedQuestions[index], index }));
  }, [activeTab, questionCategories, selectedQuestions]);

  const getEmptyMessage = () => {
    const messages = {
      all: 'Aucune question disponible',
      correct: 'Aucune réponse correcte',
      incorrect: 'Aucune réponse incorrecte',
      unanswered: 'Aucune question non répondue'
    };
    return messages[activeTab];
  };

  const getEmptyIcon = () => {
    const icons = {
      all: 'list',
      correct: 'smile-o',
      incorrect: 'frown-o',
      unanswered: 'meh-o'
    };
    return icons[activeTab];
  };

  const saveExamData = useCallback(async (): Promise<boolean> => {
    if (saveAttemptRef.current || saveStatus === 'saving' || saveStatus === 'saved') {
      console.log('⚠️ Sauvegarde déjà en cours ou terminée');
      return saveStatus === 'saved';
    }
    
    try {
      saveAttemptRef.current = true;
      setSaveStatus('saving');
      console.log('🔄 Début de la sauvegarde...');
      
      let actualDuration = examDuration || 0;
      
      if (actualDuration <= 0) {
        console.warn('⚠️ Durée invalide, calcul de fallback...');
        if (examStartTime) {
          const calculatedDuration = Math.floor((Date.now() - examStartTime) / 1000);
          actualDuration = Math.min(calculatedDuration, 45 * 60);
        } else {
          actualDuration = Math.floor(totalQuestions * 60);
        }
      }
      
      actualDuration = Math.min(actualDuration, 45 * 60);
      
      console.log(`⏱️ Durée utilisée: ${actualDuration} secondes (${formatDuration(actualDuration)})`);
      
      await databaseService.initDatabase();
      const sessionId = await databaseService.saveExamSession(
        actualDuration,
        score,
        totalQuestions,
        selectedQuestions,
        selectedAnswers
      );
      
      setSaveStatus('saved');
      console.log('✅ Session sauvegardée avec ID:', sessionId);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      
      Alert.alert(
        'Erreur de sauvegarde', 
        'Les données de l\'examen n\'ont pas pu être sauvegardées. Vous pouvez réessayer.'
      );
      return false;
    }
  }, [saveStatus, score, totalQuestions, selectedQuestions, selectedAnswers, examDuration, examStartTime]);

  useEffect(() => {
    console.log('🚀 Composant monté, lancement de la sauvegarde...');
    console.log('📊 Paramètres reçus:', {
      score,
      totalQuestions,
      examDuration: examDuration || 'non fournie',
      examStartTime: examStartTime ? new Date(examStartTime).toLocaleString() : 'non fourni'
    });
    saveExamData();
  }, []);

  const handleReturnHome = useCallback(async () => {
    if (saveStatus === 'saving') {
      console.log('⏳ Attente de la fin de sauvegarde...');
      while (saveStatus === 'saving') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('🏠 Navigation vers l\'accueil');
    navigation.navigate('HomeScreen');
  }, [saveStatus, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      e.preventDefault();
      
      if (saveStatus === 'saving') {
        console.log('⏳ Attente sauvegarde avant navigation...');
        while (saveStatus === 'saving') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('⬅️ Navigation vers l\'écran examen');
      navigation.navigate('ExamenScreen');
    });
    
    return unsubscribe;
  }, [navigation, saveStatus]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Récapitulatif Examen' });
  }, [navigation]);

  const filters = [
    { title: 'Tout afficher', count: totalQuestions, tab: 'all' as TabType, color: '#6366F1' },
    { title: 'Correctes', count: questionCategories.correct.length, tab: 'correct' as TabType, color: '#059669' },
    { title: 'Incorrectes', count: questionCategories.incorrect.length, tab: 'incorrect' as TabType, color: '#DC2626' },
    { title: 'Non répondues', count: questionCategories.unanswered.length, tab: 'unanswered' as TabType, color: '#D97706' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerWrapper}>
        <View style={[styles.header, { backgroundColor: '#fff' }]}>
          <Text style={[styles.title, { color: theme.text }]}>Examen terminé !</Text>
          <Text style={[styles.scoreText, { color: theme.text }]}>
            Votre score est de <Text style={{ fontWeight: 'bold' }}>{score}/{totalQuestions}</Text>
          </Text>
          {(examDuration || examStartTime) && (
            <Text style={[styles.durationText, { color: theme.textLight }]}>
              Durée : {formatDuration(examDuration || Math.floor((Date.now() - (examStartTime || Date.now())) / 1000))}
            </Text>
          )}
          <Text style={[styles.scoreStatus, { color: scoreStatus.color }]}>
            {scoreStatus.text}
          </Text>
          
          {saveStatus === 'saving' && (
            <Text style={[styles.savingText, { color: theme.textLight }]}>
              💾 Sauvegarde en cours...
            </Text>
          )}
          {saveStatus === 'saved' && (
            <Text style={[styles.savedText, { color: theme.success }]}>
              ✅ Données sauvegardées
            </Text>
          )}
          {saveStatus === 'error' && (
            <TouchableOpacity onPress={() => {
              saveAttemptRef.current = false;
              setSaveStatus('pending');
              saveExamData();
            }}>
              <Text style={[styles.errorText, { color: theme.error }]}>
                ❌ Erreur sauvegarde - Réessayer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={[styles.filtersTitle, { color: theme.textLight }]}>Filtrer les résultats</Text>
        <View style={styles.chipsContainer}>
          {filters.map(({ title, count, tab, color }) => (
            <FilterChip
              key={tab}
              title={title}
              count={count}
              isActive={activeTab === tab}
              onPress={() => setActiveTab(tab)}
              color={color}
            />
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(({ question, index }) => (
            <QuestionItem 
              key={index} 
              question={question} 
              index={index} 
              selectedAnswers={selectedAnswers}
              theme={theme}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name={getEmptyIcon()} size={48} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              {getEmptyMessage()}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
        <TouchableOpacity 
          style={[
            styles.homeButton, 
            { 
              backgroundColor: saveStatus === 'saving' ? theme.textLight : theme.primary,
              opacity: saveStatus === 'saving' ? 0.7 : 1
            }
          ]} 
          onPress={handleReturnHome}
          activeOpacity={0.7}
          disabled={saveStatus === 'saving'}
        >
          <Icon name="home" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {saveStatus === 'saving' ? 'Sauvegarde...' : 'Retour à l\'accueil'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: spacing.m 
  },
  headerWrapper: {
    marginBottom: spacing.s,
    borderRadius: borderRadius.medium,
    ...shadowStyles.medium,
  },
  header: {
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    padding: spacing.s,
  },
  title: { 
    fontSize: typography.heading2, 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs 
  },
  scoreText: { 
    fontSize: typography.body2,
    marginBottom: spacing.xs / 2
  },
  durationText: {
    fontSize: typography.body2,
    marginBottom: spacing.xs / 2,
    fontStyle: 'italic',
  },
  scoreStatus: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
  },
  savingText: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  savedText: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeightMedium,
  },
  errorText: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeightMedium,
    textDecorationLine: 'underline',
  },
  filtersContainer: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.xs,
  },
  filtersTitle: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.m,
    color: '#6B7280',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chipText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginRight: spacing.s,
  },
  chipBadge: {
    borderRadius: 10,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: spacing.l
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.body1,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  questionWrapper: {
    marginBottom: spacing.m,
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
  },
  questionContainer: {
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
  noAnswerText: {
    fontSize: typography.body2,
    fontStyle: 'italic',
    marginTop: spacing.s,
  },
  footerContainer: {
    paddingTop: spacing.m,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
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