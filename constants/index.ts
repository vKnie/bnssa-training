// constants/index.ts

// Configuration de l'examen
export const EXAM_CONFIG = {
  DURATION_MINUTES: 45,
  TOTAL_QUESTIONS: 40,
  PASSING_SCORE: 30,
  MIN_OPTIONS_PER_QUESTION: 3,
  MAX_OPTIONS_PER_QUESTION: 5,
} as const;

// Configuration de l'entraînement
export const TRAINING_CONFIG = {
  MAX_QUESTIONS_PER_SESSION: 40,
  DEFAULT_QUESTIONS_COUNT: 20,
} as const;

// Messages de l'application
export const MESSAGES = {
  EXAM: {
    CONFIRMATION_QUIT: 'Êtes-vous sûr de vouloir quitter l\'examen ?',
    TIME_UP: 'Temps écoulé ! L\'examen se termine automatiquement.',
    COMPLETED: 'Examen terminé !',
  },
  TRAINING: {
    CONFIRMATION_QUIT: 'Êtes-vous sûr de vouloir quitter l\'entraînement ?',
    COMPLETED: 'Questionnaire terminé !',
    NO_THEMES_SELECTED: 'Veuillez sélectionner au moins un thème.',
  },
  COMMON: {
    LOADING: 'Chargement...',
    ERROR: 'Une erreur est survenue',
    SUCCESS: 'Opération réussie',
  },
} as const;

// Durées des animations (en ms)
export const ANIMATION_DURATIONS = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
  PULSE_FAST: 500,
  PULSE_SLOW: 800,
} as const;

// Couleurs par défaut
export const DEFAULT_COLORS = {
  PRIMARY: '#3766B7',
  SECONDARY: '#6C8DC2',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  BACKGROUND: '#F5F7FA',
  CARD: '#FFFFFF',
  TEXT: '#333333',
  TEXT_LIGHT: '#666666',
  BORDER: '#E0E0E0',
} as const;

// Breakpoints pour le responsive design
export const BREAKPOINTS = {
  SMALL: 480,
  MEDIUM: 768,
  LARGE: 1024,
} as const;

// Seuils pour les scores
export const SCORE_THRESHOLDS = {
  EXCELLENT: 75,
  GOOD: 50,
  POOR: 0,
} as const;

// Délais pour les timers
export const TIMER_DELAYS = {
  WARNING_TIME: 300, // 5 minutes
  CRITICAL_TIME: 60,  // 1 minute
} as const;

// Tailles d'icônes standardisées
export const ICON_SIZES = {
  SMALL: 16,
  MEDIUM: 24,
  LARGE: 32,
  EXTRA_LARGE: 40,
} as const;

// Keys pour le stockage local (si utilisé)
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  TRAINING_HISTORY: 'training_history',
  THEME_SELECTION: 'theme_selection',
} as const;

// Configuration des alertes
export const ALERT_CONFIG = {
  BUTTONS: {
    OK: 'OK',
    CANCEL: 'Annuler',
    YES: 'Oui',
    NO: 'Non',
    CONTINUE: 'Continuer',
    QUIT: 'Quitter',
  },
} as const;

// Types d'événements pour l'analytics (si utilisé)
export const ANALYTICS_EVENTS = {
  EXAM_STARTED: 'exam_started',
  EXAM_COMPLETED: 'exam_completed',
  TRAINING_STARTED: 'training_started',
  TRAINING_COMPLETED: 'training_completed',
  THEME_SELECTED: 'theme_selected',
  QUESTION_ANSWERED: 'question_answered',
} as const;

// Configuration des dimensions du header
export const HEADER_CONFIG = {
  HEIGHT_IOS: 75,
  HEIGHT_ANDROID: 60,
  CONCAVE_HEIGHT: 25,
  TRANSPARENT_SPACE: 12,
} as const;