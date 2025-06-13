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

// Type pour les paramètres reçus de l'écran précédent
type TrainingSessionScreenRouteProp = RouteProp<RootStackParamList, 'TrainingSession'>;

const TrainingSession: React.FC = () => {
  const route = useRoute<TrainingSessionScreenRouteProp>();
  // Extraction des paramètres : thèmes sélectionnés et mode instantané
  const { selectedThemes, instantAnswerMode = false } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // Gestion des zones sécurisées
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);

  // États principaux de la session d'entraînement
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]); // Questions sélectionnées pour la session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index de la question actuelle
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Réponses sélectionnées pour la question courante
  const [score, setScore] = useState(0); // Score actuel de l'utilisateur
  const [showAnswers, setShowAnswers] = useState(false); // Affichage des bonnes réponses (mode instantané)

  // Mémoisation des questions de tous les thèmes sélectionnés
  const allQuestions = useMemo(() => {
    return selectedThemes.flatMap(themeName =>
      questionsData.themes.find(theme => theme.theme_name === themeName)?.questions || []
    );
  }, [selectedThemes]);

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

  // Configuration du titre de l'écran avec indication du mode
  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: `Session d'entrainement${instantAnswerMode ? ' (Mode instantané)' : ''}`,
    });
  }, [navigation, instantAnswerMode]);

  // Initialisation des questions et gestion de la navigation
  useEffect(() => {
    // Mélange aléatoire et sélection de 40 questions maximum
    const shuffledQuestions = [...allQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 40);
    setSelectedQuestions(shuffledQuestions);

    // Listener pour intercepter la sortie de l'écran avec confirmation
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

    return unsubscribe; // Nettoyage du listener
  }, [navigation, allQuestions]);

  // Gestionnaire de sélection/désélection des réponses
  const handleAnswerSelection = useCallback((answer: string) => {
    if (showAnswers) return; // Bloque la sélection si les réponses sont affichées
    
    setSelectedAnswers(prev => 
      prev.includes(answer) 
        ? prev.filter(a => a !== answer) // Désélectionner si déjà sélectionné
        : [...prev, answer] // Ajouter à la sélection
    );
  }, [showAnswers]);

  // Gestionnaire de validation des réponses (mode instantané)
  const handleValidateAnswers = useCallback(() => {
    if (instantAnswerMode && !showAnswers) {
      setTimeout(() => setShowAnswers(true), 300); // Délai pour l'animation
    }
  }, [instantAnswerMode, showAnswers]);

  // Gestionnaire de passage à la question suivante ou fin de session
  const handleNextQuestion = useCallback(() => {
    const isCorrect = isCorrectAnswer();
    
    // Mise à jour du score si la réponse est correcte
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Passage à la question suivante ou fin de la session
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]); // Réinitialisation des réponses
      setShowAnswers(false); // Masquage des réponses
    } else {
      // Calcul du score final et affichage du résultat
      const finalScore = score + (isCorrect ? 1 : 0);
      const successRate = (finalScore / selectedQuestions.length) * 100;
      
      // Message personnalisé selon le taux de réussite
      let message = `Votre score est de ${finalScore}/${selectedQuestions.length}`;
      if (successRate >= 80) {
        message += "\n\nExcellent travail ! Continuez comme ça !";
      } else if (successRate >= 60) {
        message += "\n\nBon travail ! Continuez à vous entraîner.";
      } else {
        message += "\n\nContinuez à vous entraîner pour améliorer vos résultats.";
      }
      
      // Alerte de fin avec retour à l'écran précédent
      Alert.alert(
        'Questionnaire terminé !',
        message,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isCorrectAnswer, currentQuestionIndex, selectedQuestions.length, score, navigation]);

  // Fonction pour déterminer le style des boutons de réponse selon l'état
  const getOptionStyle = useCallback((option: string) => {
    const isSelected = selectedAnswers.includes(option);
    const isCorrect = currentQuestion?.correct_answers.includes(option);
    
    // Styles pour le mode instantané avec réponses affichées
    if (showAnswers && instantAnswerMode) {
      if (isCorrect) {
        return { bg: theme.success, border: theme.success, text: '#FFFFFF' }; // Bonne réponse en vert
      } else if (isSelected && !isCorrect) {
        return { bg: theme.error, border: theme.error, text: '#FFFFFF' }; // Mauvaise réponse sélectionnée en rouge
      }
      return { bg: theme.card, border: '#ccc', text: theme.text }; // Réponse neutre
    }
    
    // Styles standard selon la sélection
    return {
      bg: isSelected ? theme.success : theme.card,
      border: isSelected ? theme.success : '#ccc',
      text: isSelected ? '#FFFFFF' : theme.text
    };
  }, [selectedAnswers, currentQuestion, showAnswers, instantAnswerMode, theme]);

  // Composant bouton de réponse mémorisé pour optimiser les performances
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
            disabled={showAnswers} // Désactivé quand les réponses sont affichées
          />
          {/* Icône de résultat en mode instantané */}
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

  // Composant de feedback instantané
  const renderFeedback = () => {
    if (!showAnswers || !instantAnswerMode) return null;
    
    const isCorrect = isCorrectAnswer();
    
    return (
      <View style={[
        styles.feedback, 
        { 
          backgroundColor: isCorrect ? `${theme.success}20` : `${theme.error}20`, // Fond semi-transparent
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

  // Écran de chargement pendant la préparation des questions
  if (!currentQuestion) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Chargement...</Text>
      </View>
    );
  }

  // Condition pour activer les boutons de navigation
  const canProceed = selectedAnswers.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Section d'en-tête avec progression et indicateurs */}
      <View style={styles.header}>
        {/* Barre de progression visuelle */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <View style={styles.progressRow}>
          {/* Compteur de questions */}
          <Text style={[styles.progressText, { color: theme.text }]}>
            {currentQuestionIndex + 1}/{selectedQuestions.length}
          </Text>
          {/* Indicateur de mode instantané */}
          {instantAnswerMode && (
            <View style={styles.modeIndicator}>
              <Icon name="flash-on" size={16} color={theme.primary} />
              <Text style={[styles.modeText, { color: theme.primary }]}>Mode instantané</Text>
            </View>
          )}
        </View>
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
            <OptionButton key={index} option={option} index={index} />
          ))}
          
          {/* Feedback instantané si activé */}
          {renderFeedback()}
        </View>
      </ScrollView>
      
      {/* Pied de page avec boutons de navigation adaptatifs */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
        {instantAnswerMode && !showAnswers ? (
          // Bouton de validation en mode instantané
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
          // Bouton de navigation vers la question suivante
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
  // Conteneur principal avec padding horizontal
  container: { 
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  // Style pour l'état de chargement centré
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // En-tête avec progression et indicateurs
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
    overflow: 'hidden', // Pour les coins arrondis
    marginBottom: spacing.s,
  },
  // Barre de progression animée
  progressBar: { 
    height: '100%', 
    borderRadius: borderRadius.small,
  },
  // Ligne avec compteur et indicateur de mode
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Texte du compteur de progression
  progressText: { 
    fontSize: typography.body1, 
    fontWeight: typography.fontWeightMedium,
  },
  // Indicateur visuel du mode instantané
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Texte de l'indicateur de mode
  modeText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.xs / 2,
  },
  // ScrollView principal
  scrollView: {
    flex: 1,
  },
  // Contenu du scroll centré verticalement
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
  // Conteneur relatif pour l'icône de résultat
  optionContainer: {
    position: 'relative',
    width: '100%',
  },
  // Icône de résultat positionnée en absolu
  resultIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }], // Centrage vertical
  },
  // Carte de feedback avec bordure colorée
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
  },
  // Texte du feedback
  feedbackText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.s,
  },
  // Pied de page avec padding adaptatif
  footer: {
    paddingTop: spacing.m,
  },
  // Texte de chargement
  loadingText: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
});

export default TrainingSession;