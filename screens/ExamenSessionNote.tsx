// screens/ExamenSessionNote.tsx
import React, { useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
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

// Types pour la navigation et les routes
type ExamenSessionNoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenSessionNote'>;
type ExamenSessionNoteScreenRouteProp = RouteProp<RootStackParamList, 'ExamenSessionNote'>;
type TabType = 'all' | 'correct' | 'incorrect' | 'unanswered'; // Types de filtres disponibles

// Composant pour afficher chaque option de réponse avec son statut
const AnswerItem: React.FC<{
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  theme: any;
}> = ({ option, isCorrect, isSelected, theme }) => (
  <View style={styles.answerContainer}>
    {/* Icône indiquant le statut de la réponse */}
    <Icon
      name={isCorrect ? 'check-circle' : isSelected ? 'times-circle' : 'circle'}
      size={20}
      color={isCorrect ? theme.success : isSelected ? theme.error : theme.neutral}
    />
    {/* Texte de l'option avec styles conditionnels */}
    <Text 
      style={[
        styles.answerText, 
        { color: theme.text },
        isSelected && !isCorrect && [styles.wrongAnswer, { color: theme.error }], // Mauvaise réponse sélectionnée
        isCorrect && [styles.correctAnswer, { color: theme.success }] // Bonne réponse
      ]}
    >
      {option}
    </Text>
  </View>
);

// Composant pour afficher une question complète avec toutes ses réponses
const QuestionItem: React.FC<{
  question: Question;
  index: number;
  selectedAnswers: string[][];
  theme: any;
}> = ({ question, index, selectedAnswers, theme }) => (
  <View style={styles.questionWrapper}>
    <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
      {/* Titre de la question */}
      <Text style={[styles.questionText, { color: theme.text }]}>
        Question {index + 1}: {question.question}
      </Text>
      
      {/* Affichage de toutes les options avec leur statut */}
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
      
      {/* Section des réponses utilisateur */}
      {selectedAnswers[index]?.length > 0 ? (
        <>
          <Text style={[styles.userAnswerLabel, { color: theme.textLight }]}>
            Vos réponses :
          </Text>
          {/* Affichage des réponses sélectionnées par l'utilisateur */}
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
        // Message pour les questions non répondues
        <Text style={[styles.noAnswerText, { color: theme.error }]}>
          Aucune réponse fournie
        </Text>
      )}
    </View>
  </View>
);

// Composant puce de filtre cliquable avec compteur
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
        shadowColor: isActive ? color : '#000', // Ombre colorée quand actif
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {/* Titre du filtre */}
    <Text style={[
      styles.chipText,
      { color: isActive ? '#FFFFFF' : '#6B7280' }
    ]}>
      {title}
    </Text>
    {/* Badge avec le nombre d'éléments */}
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
  // Extraction des paramètres passés depuis l'écran précédent
  const { score, totalQuestions, selectedQuestions, selectedAnswers } = route.params;
  const insets = useSafeAreaInsets(); // Gestion des zones sécurisées
  
  const theme = getThemeForScreen(route.name);
  const [activeTab, setActiveTab] = useState<TabType>('all'); // Filtre actuel
  
  // Calcul du pourcentage de réussite
  const successPercentage = (score / totalQuestions) * 100;
  
  // Fonction pour déterminer le statut du score avec couleur associée
  const getScoreStatus = () => {
    if (successPercentage >= 75) return { text: 'Excellent!', color: theme.success };
    if (successPercentage >= 50) return { text: 'Satisfaisant', color: '#FFA000' };
    return { text: 'À améliorer', color: theme.error };
  };

  const scoreStatus = getScoreStatus();

  // Mémoisation des catégories de questions pour optimiser les performances
  const questionCategories = useMemo(() => {
    const correct: number[] = [];
    const incorrect: number[] = [];
    const unanswered: number[] = [];

    // Classification de chaque question selon son statut
    selectedQuestions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      
      if (userAnswers.length === 0) {
        unanswered.push(index); // Pas de réponse
      } else {
        // Vérification si la réponse est complètement correcte
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

  // Filtrage des questions selon l'onglet actif
  const filteredQuestions = useMemo(() => {
    if (activeTab === 'all') {
      return selectedQuestions.map((question, index) => ({ question, index }));
    }
    
    const indices = questionCategories[activeTab];
    return indices.map(index => ({ question: selectedQuestions[index], index }));
  }, [activeTab, questionCategories, selectedQuestions]);

  // Messages d'état vide selon le filtre actif
  const getEmptyMessage = () => {
    const messages = {
      all: 'Aucune question disponible',
      correct: 'Aucune réponse correcte',
      incorrect: 'Aucune réponse incorrecte',
      unanswered: 'Aucune question non répondue'
    };
    return messages[activeTab];
  };

  // Icônes d'état vide selon le filtre actif
  const getEmptyIcon = () => {
    const icons = {
      all: 'list',
      correct: 'smile-o',
      incorrect: 'frown-o',
      unanswered: 'meh-o'
    };
    return icons[activeTab];
  };

  // Gestionnaire de retour à l'accueil
  const handleReturnHome = useCallback(() => {
    navigation.navigate('HomeScreen');
  }, [navigation]);

  // Gestion du bouton retour - redirection vers l'écran d'examen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('ExamenScreen');
    });
    return unsubscribe;
  }, [navigation]);

  // Configuration du titre de l'écran
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Récapitulatif Examen' });
  }, [navigation]);

  // Configuration des filtres avec leurs couleurs et compteurs
  const filters = [
    { title: 'Tout afficher', count: totalQuestions, tab: 'all' as TabType, color: '#6366F1' },
    { title: 'Correctes', count: questionCategories.correct.length, tab: 'correct' as TabType, color: '#059669' },
    { title: 'Incorrectes', count: questionCategories.incorrect.length, tab: 'incorrect' as TabType, color: '#DC2626' },
    { title: 'Non répondues', count: questionCategories.unanswered.length, tab: 'unanswered' as TabType, color: '#D97706' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Section d'en-tête avec le score et le statut */}
      <View style={styles.headerWrapper}>
        <View style={[styles.header, { backgroundColor: '#fff' }]}>
          <Text style={[styles.title, { color: theme.text }]}>Examen terminé !</Text>
          <Text style={[styles.scoreText, { color: theme.text }]}>
            Votre score est de <Text style={{ fontWeight: 'bold' }}>{score}/{totalQuestions}</Text>
          </Text>
          <Text style={[styles.scoreStatus, { color: scoreStatus.color }]}>
            {scoreStatus.text}
          </Text>
        </View>
      </View>

      {/* Section des filtres avec puces cliquables */}
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

      {/* Liste scrollable des questions filtrées */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {filteredQuestions.length > 0 ? (
          // Affichage des questions filtrées
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
          // État vide avec icône et message
          <View style={styles.emptyContainer}>
            <Icon name={getEmptyIcon()} size={48} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              {getEmptyMessage()}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Bouton de retour à l'accueil en pied de page */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: theme.primary }]} 
          onPress={handleReturnHome}
          activeOpacity={0.7}
        >
          <Icon name="home" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal avec padding uniforme
  container: { 
    flex: 1, 
    padding: spacing.m 
  },
  // Wrapper de l'en-tête avec ombre
  headerWrapper: {
    marginBottom: spacing.s,
    borderRadius: borderRadius.medium,
    ...shadowStyles.medium,
  },
  // En-tête centré avec informations du score
  header: {
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    padding: spacing.s,
  },
  // Titre principal de l'écran
  title: { 
    fontSize: typography.heading2, 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs 
  },
  // Texte d'affichage du score
  scoreText: { 
    fontSize: typography.body2,
    marginBottom: spacing.xs / 2
  },
  // Texte du statut coloré selon le score
  scoreStatus: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
  },
  // Conteneur des filtres
  filtersContainer: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.xs,
  },
  // Titre de la section filtres
  filtersTitle: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
    marginBottom: spacing.m,
    color: '#6B7280',
  },
  // Conteneur flex pour les puces de filtre
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Passage à la ligne si nécessaire
    gap: spacing.s,
  },
  // Style des puces de filtre avec ombre
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
    elevation: 2, // Ombre sur Android
  },
  // Texte des puces de filtre
  chipText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginRight: spacing.s,
  },
  // Badge numérique dans les puces
  chipBadge: {
    borderRadius: 10,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Texte du badge numérique
  chipBadgeText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
  },
  // Conteneur du scroll avec padding en bas
  scrollContainer: { 
    flexGrow: 1, 
    paddingBottom: spacing.l
  },
  // Conteneur d'état vide centré
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  // Texte d'état vide
  emptyText: {
    fontSize: typography.body1,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  // Wrapper de chaque question avec ombre
  questionWrapper: {
    marginBottom: spacing.m,
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
  },
  // Conteneur de question avec padding
  questionContainer: {
    padding: spacing.m,
    borderRadius: borderRadius.medium,
  },
  // Style du texte de la question
  questionText: { 
    fontSize: typography.body1, 
    fontWeight: typography.fontWeightBold, 
    marginBottom: spacing.m 
  },
  // Conteneur horizontal pour chaque réponse
  answerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing.xs 
  },
  // Style du texte des réponses
  answerText: { 
    fontSize: typography.body2, 
    marginLeft: spacing.s 
  },
  // Style pour les bonnes réponses
  correctAnswer: { 
    fontWeight: typography.fontWeightBold
  },
  // Style pour les mauvaises réponses sélectionnées
  wrongAnswer: { 
    textDecorationLine: 'line-through'
  },
  // Label des réponses utilisateur
  userAnswerLabel: { 
    fontSize: typography.body2, 
    marginTop: spacing.m, 
    fontStyle: 'italic'
  },
  // Style des réponses utilisateur
  userAnswerText: { 
    fontSize: typography.body2, 
    marginLeft: spacing.s
  },
  // Texte pour les questions non répondues
  noAnswerText: {
    fontSize: typography.body2,
    fontStyle: 'italic',
    marginTop: spacing.s,
  },
  // Conteneur du pied de page avec padding adaptatif
  footerContainer: {
    paddingTop: spacing.m,
  },
  // Bouton de retour à l'accueil avec icône
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    ...shadowStyles.medium,
  },
  // Texte du bouton de retour
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  // Icône du bouton de retour
  buttonIcon: {
    marginRight: spacing.s,
  },
});

export default ExamenSessionNote;