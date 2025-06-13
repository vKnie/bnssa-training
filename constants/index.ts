// constants/index.ts

// === CONFIGURATION DE L'EXAMEN BNSSA ===

// Configuration principale de l'examen officiel BNSSA
export const EXAM_CONFIG = {
  DURATION_MINUTES: 45,                    // Durée totale de l'examen en minutes
  TOTAL_QUESTIONS: 40,                     // Nombre total de questions dans un examen
  PASSING_SCORE: 30,                       // Score minimum requis pour réussir (30/40 = 75%)
  MIN_OPTIONS_PER_QUESTION: 3,             // Nombre minimum d'options par question
  MAX_OPTIONS_PER_QUESTION: 5,             // Nombre maximum d'options par question
} as const;

// === CONFIGURATION DE L'ENTRAÎNEMENT ===

// Paramètres pour les sessions d'entraînement personnalisées
export const TRAINING_CONFIG = {
  MAX_QUESTIONS_PER_SESSION: 40,           // Limite maximale de questions par session d'entraînement
  DEFAULT_QUESTIONS_COUNT: 20,             // Nombre par défaut de questions si non spécifié
} as const;

// === MESSAGES UTILISATEUR LOCALISÉS ===

// Tous les messages affichés dans l'interface utilisateur
export const MESSAGES = {
  EXAM: {
    CONFIRMATION_QUIT: 'Êtes-vous sûr de vouloir quitter l\'examen ?',      // Confirmation avant de quitter l'examen
    TIME_UP: 'Temps écoulé ! L\'examen se termine automatiquement.',        // Message quand le temps expire
    COMPLETED: 'Examen terminé !',                                          // Message de fin d'examen
  },
  TRAINING: {
    CONFIRMATION_QUIT: 'Êtes-vous sûr de vouloir quitter l\'entraînement ?', // Confirmation avant de quitter l'entraînement
    COMPLETED: 'Questionnaire terminé !',                                    // Message de fin d'entraînement
    NO_THEMES_SELECTED: 'Veuillez sélectionner au moins un thème.',          // Erreur si aucun thème sélectionné
  },
  COMMON: {
    LOADING: 'Chargement...',               // Message de chargement générique
    ERROR: 'Une erreur est survenue',       // Message d'erreur générique
    SUCCESS: 'Opération réussie',           // Message de succès générique
  },
} as const;

// === CONFIGURATION DES ANIMATIONS ===

// Durées standardisées pour les animations et transitions (en millisecondes)
export const ANIMATION_DURATIONS = {
  SHORT: 200,                             // Animations rapides (boutons, hover)
  MEDIUM: 300,                            // Animations moyennes (transitions d'écran)
  LONG: 500,                              // Animations longues (modals, slides)
  PULSE_FAST: 500,                        // Pulsation rapide pour les éléments d'attention
  PULSE_SLOW: 800,                        // Pulsation lente pour les éléments de feedback
} as const;

// === PALETTE DE COULEURS PAR DÉFAUT ===

// Couleurs principales de l'application avec codes hexadécimaux
export const DEFAULT_COLORS = {
  PRIMARY: '#3766B7',                     // Couleur principale (bleu BNSSA)
  SECONDARY: '#6C8DC2',                   // Couleur secondaire (bleu plus clair)
  SUCCESS: '#4CAF50',                     // Vert pour les succès et bonnes réponses
  ERROR: '#F44336',                       // Rouge pour les erreurs et mauvaises réponses
  WARNING: '#FF9800',                     // Orange pour les avertissements
  INFO: '#2196F3',                        // Bleu pour les informations
  BACKGROUND: '#F5F7FA',                  // Couleur de fond principale (gris très clair)
  CARD: '#FFFFFF',                        // Couleur de fond des cartes et conteneurs
  TEXT: '#333333',                        // Couleur du texte principal (gris foncé)
  TEXT_LIGHT: '#666666',                  // Couleur du texte secondaire (gris moyen)
  BORDER: '#E0E0E0',                      // Couleur des bordures (gris clair)
} as const;

// === BREAKPOINTS POUR LE RESPONSIVE DESIGN ===

// Points de rupture pour l'adaptation aux différentes tailles d'écran (en pixels)
export const BREAKPOINTS = {
  SMALL: 480,                             // Smartphones en portrait
  MEDIUM: 768,                            // Tablettes en portrait / smartphones en paysage
  LARGE: 1024,                            // Tablettes en paysage / petits écrans desktop
} as const;

// === SEUILS DE PERFORMANCE ===

// Pourcentages pour catégoriser les performances des utilisateurs
export const SCORE_THRESHOLDS = {
  EXCELLENT: 75,                          // 75% et plus = Excellent
  GOOD: 50,                               // 50-74% = Satisfaisant
  POOR: 0,                                // 0-49% = À améliorer
} as const;

// === CONFIGURATION DES TIMERS ===

// Seuils temporels pour les alertes pendant l'examen (en secondes)
export const TIMER_DELAYS = {
  WARNING_TIME: 300,                      // Avertissement à 5 minutes restantes
  CRITICAL_TIME: 60,                      // Alerte critique à 1 minute restante
} as const;

// === TAILLES D'ICÔNES STANDARDISÉES ===

// Tailles d'icônes cohérentes dans toute l'application (en pixels)
export const ICON_SIZES = {
  SMALL: 16,                              // Petites icônes (indicateurs, puces)
  MEDIUM: 24,                             // Icônes moyennes (boutons, navigation)
  LARGE: 32,                              // Grandes icônes (en-têtes, actions principales)
  EXTRA_LARGE: 40,                        // Très grandes icônes (logos, illustrations)
} as const;

// === CLÉS DE STOCKAGE LOCAL ===

// Clés standardisées pour le stockage persistant des données utilisateur
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',    // Préférences utilisateur (thème, paramètres)
  TRAINING_HISTORY: 'training_history',    // Historique des sessions d'entraînement
  THEME_SELECTION: 'theme_selection',      // Dernière sélection de thèmes
} as const;

// === CONFIGURATION DES ALERTES ===

// Textes standardisés pour les boutons d'alerte et de confirmation
export const ALERT_CONFIG = {
  BUTTONS: {
    OK: 'OK',                             // Bouton de confirmation simple
    CANCEL: 'Annuler',                    // Bouton d'annulation
    YES: 'Oui',                           // Confirmation positive
    NO: 'Non',                            // Confirmation négative
    CONTINUE: 'Continuer',                // Action de poursuite
    QUIT: 'Quitter',                      // Action de sortie
  },
} as const;

// === ÉVÉNEMENTS POUR L'ANALYTIQUE ===

// Noms d'événements standardisés pour le tracking et l'analyse d'usage
export const ANALYTICS_EVENTS = {
  EXAM_STARTED: 'exam_started',           // Démarrage d'un examen
  EXAM_COMPLETED: 'exam_completed',       // Fin d'un examen
  TRAINING_STARTED: 'training_started',   // Démarrage d'un entraînement
  TRAINING_COMPLETED: 'training_completed', // Fin d'un entraînement
  THEME_SELECTED: 'theme_selected',       // Sélection d'un thème
  QUESTION_ANSWERED: 'question_answered', // Réponse à une question
} as const;

// === CONFIGURATION DU HEADER ===

// Dimensions et espacements pour les en-têtes selon la plateforme (en pixels)
export const HEADER_CONFIG = {
  HEIGHT_IOS: 75,                         // Hauteur de l'en-tête sur iOS (avec status bar)
  HEIGHT_ANDROID: 60,                     // Hauteur de l'en-tête sur Android
  CONCAVE_HEIGHT: 25,                     // Hauteur des éléments concaves/arrondis
  TRANSPARENT_SPACE: 12,                  // Espace transparent pour les gradients
} as const;