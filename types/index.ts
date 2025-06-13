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