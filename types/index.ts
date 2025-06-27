// types/index.ts

// === INTERFACES POUR LES DONNÉES DE QUESTIONS ===

// Interface représentant une question individuelle
export interface Question {
  question: string;           // Texte de la question
  options: string[];          // Tableau des options de réponse disponibles
  correct_answers: string[];  // Tableau des bonnes réponses (peut y en avoir plusieurs)
  theme_name: string;         // Nom du thème auquel appartient la question
}

// Interface représentant un thème de questions
export interface Theme {
  theme_name: string;         // Nom du thème (ex: "Premiers secours", "Surveillance")
  questions: Question[];      // Tableau des questions appartenant à ce thème
}

// Interface pour la structure complète des données de questions
export interface QuestionsData {
  themes: Theme[];            // Tableau de tous les thèmes disponibles
}

// === TYPES POUR LA NAVIGATION ===

// Type définissant toutes les routes de l'application avec leurs paramètres
export type RootStackParamList = {
  HomeScreen: undefined;                    // Écran d'accueil - aucun paramètre
  ExamenScreen: undefined;                  // Écran de préparation à l'examen - aucun paramètre
  TrainingScreen: undefined;                // Écran de sélection des thèmes d'entraînement - aucun paramètre
  HistoricScreen: undefined;                // Écran d'historique des examens - aucun paramètre
  HistoricScreenTraining: undefined;        // Écran d'historique des entraînements - aucun paramètre
  
  // Écran de session d'entraînement - avec paramètres de configuration
  TrainingSession: {
    selectedThemes: string[];               // Tableau des noms de thèmes sélectionnés
    instantAnswerMode?: boolean;            // Mode réponse instantanée (optionnel, défaut: false)
  };
  
  ExamenSession: undefined;                 // Écran de session d'examen - aucun paramètre
  
  // Écran de récapitulatif d'examen - avec résultats et données
  ExamenSessionNote: {
    score: number;                          // Score obtenu par l'utilisateur
    totalQuestions: number;                 // Nombre total de questions de l'examen
    selectedQuestions: Question[];          // Tableau des questions qui ont été posées
    selectedAnswers: string[][];            // Tableau 2D des réponses sélectionnées par question
    examStartTime?: number;                 // Timestamp de début d'examen pour calcul de durée
  };
};

// === INTERFACES POUR LES COMPOSANTS UI ===

// Interface pour les props du composant TouchableButton réutilisable
export interface TouchableButtonProps {
  title: string;                            // Texte affiché sur le bouton
  onPress: () => void;                      // Fonction appelée lors du clic
  backgroundColor: string;                  // Couleur de fond du bouton
  textColor: string;                        // Couleur du texte
  width?: string | number;                  // Largeur optionnelle (%, px, ou nombre)
  iconName?: string;                        // Nom de l'icône optionnelle (Material Icons)
  borderColor?: string;                     // Couleur de bordure optionnelle
  borderWidth?: number;                     // Épaisseur de bordure optionnelle
  disabled?: boolean;                       // État désactivé optionnel
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'; // Poids de police optionnel
}

// === INTERFACES POUR LE SYSTÈME DE THÈMES ===

// Interface définissant un thème visuel complet de l'application
export interface AppTheme {
  primary: string;                          // Couleur principale (boutons, liens, éléments actifs)
  secondary: string;                        // Couleur secondaire (éléments de support)
  accent?: string;                          // Couleur d'accent optionnelle (éléments d'emphase)
  background: string;                       // Couleur de fond principal des écrans
  card: string;                             // Couleur de fond des cartes et conteneurs
  text: string;                             // Couleur du texte principal
  textLight: string;                        // Couleur du texte secondaire (sous-titres, descriptions)
  textInverse?: string;                     // Couleur du texte inversé optionnelle (sur fond sombre)
  border?: string;                          // Couleur des bordures optionnelle
  success: string;                          // Couleur pour les états de succès (bonnes réponses, validation)
  error: string;                            // Couleur pour les états d'erreur (mauvaises réponses, erreurs)
  warning?: string;                         // Couleur d'avertissement optionnelle
  info?: string;                            // Couleur d'information optionnelle
  gradient?: string[];                      // Dégradé optionnel (tableau de couleurs pour LinearGradient)
}

// Type union définissant les clés de thèmes disponibles dans l'application
export type ThemeKeyType = 'main' | 'home' | 'examen' | 'training';
// 'main' - thème principal de l'application
// 'home' - thème spécifique à l'écran d'accueil
// 'examen' - thème spécifique aux écrans d'examen
// 'training' - thème spécifique aux écrans d'entraînement

// === INTERFACES POUR LA BASE DE DONNÉES ===

// Interface pour une session d'examen sauvegardée
export interface ExamSession {
  id?: number;                              // ID unique de la session (auto-généré)
  examDate: string;                         // Date et heure de l'examen (ISO string)
  duration: number;                         // Durée de l'examen en secondes
  score: number;                            // Score obtenu (nombre de bonnes réponses)
  totalQuestions: number;                   // Nombre total de questions
  correctAnswers: number;                   // Nombre de réponses correctes
  incorrectAnswers: number;                 // Nombre de réponses incorrectes
  unansweredQuestions: number;              // Nombre de questions non répondues
  successRate: number;                      // Pourcentage de réussite
  isPassed: boolean;                        // true si score >= 30 (seuil de réussite)
}

// Interface pour les résultats par thème
export interface ThemeResult {
  id?: number;                              // ID unique du résultat (auto-généré)
  examSessionId: number;                    // ID de la session d'examen associée
  themeName: string;                        // Nom du thème
  totalQuestions: number;                   // Nombre de questions pour ce thème
  correctAnswers: number;                   // Nombre de bonnes réponses pour ce thème
  incorrectAnswers: number;                 // Nombre de mauvaises réponses pour ce thème
  unansweredQuestions: number;              // Nombre de questions non répondues pour ce thème
  successRate: number;                      // Pourcentage de réussite pour ce thème
}

// Interface pour les résultats détaillés d'un examen avec breakdown par thème
export interface DetailedExamResult {
  examSession: ExamSession;                 // Données principales de la session
  themeResults: ThemeResult[];              // Résultats détaillés par thème
}

// === INTERFACES POUR LES STATISTIQUES ===

// Interface pour les statistiques générales de l'utilisateur
export interface GeneralStats {
  totalExams: number;                       // Nombre total d'examens passés
  passedExams: number;                      // Nombre d'examens réussis
  averageScore: number;                     // Score moyen sur tous les examens
  bestScore: number;                        // Meilleur score obtenu
  successRate: number;                      // Pourcentage de réussite global
}

// Interface pour les statistiques par thème
export interface ThemeStats {
  themeName: string;                        // Nom du thème
  totalQuestions: number;                   // Total de questions rencontrées pour ce thème
  correctAnswers: number;                   // Total de bonnes réponses pour ce thème
  incorrectAnswers: number;                 // Total de mauvaises réponses pour ce thème
  unansweredQuestions: number;              // Total de questions non répondues pour ce thème
  successRate: number;                      // Pourcentage de réussite pour ce thème
  averageScore: number;                     // Score moyen pour ce thème
}

// === TYPES POUR LES ÉNUMÉRATIONS ===

// Type pour les différents statuts de réponse
export type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

// Type pour les niveaux de difficulté des questions (extension future)
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Type pour les types de sessions
export type SessionType = 'exam' | 'training';

// === INTERFACES POUR LES HOOKS ET UTILITAIRES ===

// Interface pour les résultats de validation des réponses
export interface AnswerValidationResult {
  isCorrect: boolean;                       // true si la réponse est correcte
  selectedAnswers: string[];                // Réponses sélectionnées par l'utilisateur
  correctAnswers: string[];                 // Bonnes réponses attendues
  missingAnswers: string[];                 // Bonnes réponses manquées
  extraAnswers: string[];                   // Mauvaises réponses sélectionnées
}

// Interface pour les paramètres de filtrage des questions
export interface QuestionFilter {
  themes?: string[];                        // Filtrer par thèmes spécifiques
  difficulty?: DifficultyLevel;             // Filtrer par niveau de difficulté
  maxQuestions?: number;                    // Nombre maximum de questions
  excludeAnswered?: boolean;                // Exclure les questions déjà répondues
}

// Interface pour les options de session d'entraînement
export interface TrainingSessionOptions {
  selectedThemes: string[];                 // Thèmes sélectionnés
  instantAnswerMode: boolean;               // Mode réponse instantanée
  maxQuestions?: number;                    // Nombre maximum de questions
  shuffleQuestions: boolean;                // Mélanger les questions
  showExplanations: boolean;                // Afficher les explications des réponses
}