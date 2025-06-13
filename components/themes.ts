// components/themes.ts
import { Platform, TextStyle } from 'react-native';
import { AppTheme, ThemeKeyType } from '../types';

// === DÉFINITION DES THÈMES DE L'APPLICATION ===

// Thèmes optimisés avec une structure cohérente pour différents contextes d'usage
export const appThemes: Record<ThemeKeyType, AppTheme> = {
  // Thème principal par défaut de l'application
  main: {
    primary: '#3766B7',                    // Bleu BNSSA officiel pour les éléments principaux
    secondary: '#6C8DC2',                  // Bleu plus clair pour les éléments secondaires
    accent: '#4CAF50',                     // Vert pour les accents et validations
    background: '#F5F7FA',                // Gris très clair pour le fond principal
    card: '#FFFFFF',                       // Blanc pour les cartes et conteneurs
    text: '#333333',                       // Gris foncé pour le texte principal
    textLight: '#666666',                  // Gris moyen pour le texte secondaire
    textInverse: '#FFFFFF',                // Blanc pour le texte sur fond sombre
    border: '#E0E0E0',                     // Gris clair pour les bordures
    success: '#4CAF50',                    // Vert pour les succès et bonnes réponses
    error: '#F44336',                      // Rouge pour les erreurs et mauvaises réponses
    warning: '#FF9800',                    // Orange pour les avertissements
    info: '#2196F3',                       // Bleu pour les informations
  },
  
  // Thème spécifique à l'écran d'accueil
  home: {
    primary: '#3099EF',                    // Bleu vif pour l'interface d'accueil
    secondary: '#64B5F6',                  // Bleu plus clair complémentaire
    background: '#F5F7FA',                // Fond cohérent avec le thème principal
    card: '#FFFFFF',                       // Cartes blanches pour contraste
    text: '#333333',                       // Texte sombre pour lisibilité
    textLight: '#666666',                  // Texte secondaire
    success: '#4CAF50',                    // Couleurs de statut cohérentes
    error: '#F44336',
    gradient: ['#3099EF', '#64B5F6'],     // Dégradé bleu pour les éléments visuels
  },
  
  // Thème pour les écrans d'examen (plus formel et professionnel)
  examen: {
    primary: '#1e3c72',                    // Bleu marine professionnel
    secondary: '#2a5298',                  // Bleu soutenu complémentaire
    accent: '#FF9800',                     // Orange pour les éléments d'attention
    background: '#F5F7FA',                // Fond neutre pour concentration
    card: '#FFFFFF',                       // Cartes claires pour lisibilité
    text: '#333333',                       // Texte contrasté
    textLight: '#666666',                  // Texte secondaire
    success: '#4CAF50',                    // Couleurs de feedback standard
    error: '#F44336',
    gradient: ['#1e3c72', '#2a5298'],     // Dégradé bleu marine pour sérieux
  },
  
  // Thème pour les écrans d'entraînement (plus dynamique et motivant)
  training: {
    primary: '#FF5F6D',                    // Rouge-rose énergique
    secondary: '#FFC371',                  // Orange doré chaleureux
    accent: '#4CAF50',                     // Vert pour les succès
    background: '#F5F7FA',                // Fond neutre cohérent
    card: '#FFFFFF',                       // Cartes blanches
    text: '#333333',                       // Texte standard
    textLight: '#666666',                  // Texte secondaire
    success: '#4CAF50',                    // Couleurs de statut standard
    error: '#F44336',
    gradient: ['#FF5F6D', '#FFC371'],     // Dégradé chaud et motivant
  },
};

// === MAPPING ÉCRANS → THÈMES ===

// Mapping optimisé des écrans aux thèmes pour application automatique
export const screenToTheme: Record<string, ThemeKeyType> = {
  HomeScreen: 'home',                      // Écran d'accueil → thème home
  ExamenScreen: 'examen',                  // Préparation examen → thème examen
  ExamenSession: 'examen',                 // Session d'examen → thème examen
  ExamenSessionNote: 'examen',             // Résultats examen → thème examen
  TrainingScreen: 'training',              // Sélection entraînement → thème training
  TrainingSession: 'training',             // Session d'entraînement → thème training
  HistoricScreenTraining: 'training',      // Historique entraînement → thème training
};

// === STYLES D'OMBRES MULTIPLATEFORMES ===

// Shadow styles optimisés avec adaptation iOS/Android automatique
export const shadowStyles = {
  // Ombre légère pour les éléments subtils (boutons, petites cartes)
  small: Platform.select({
    ios: {
      shadowColor: '#000',                 // Noir pour l'ombre
      shadowOffset: { width: 0, height: 1 }, // Décalage vertical minimal
      shadowOpacity: 0.05,                 // Très légère opacité
      shadowRadius: 3,                     // Flou minimal
    },
    android: {
      elevation: 2,                        // Élévation Material Design équivalente
    },
    default: {},                           // Fallback pour autres plateformes
  }),
  
  // Ombre moyenne pour les cartes et conteneurs principaux
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // Décalage plus visible
      shadowOpacity: 0.08,                   // Opacité modérée
      shadowRadius: 6,                       // Flou moyen
    },
    android: {
      elevation: 4,                          // Élévation moyenne
    },
    default: {},
  }),
  
  // Ombre forte pour les modals et éléments flottants
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 }, // Décalage prononcé
      shadowOpacity: 0.12,                   // Opacité plus forte
      shadowRadius: 10,                      // Flou important
    },
    android: {
      elevation: 8,                          // Forte élévation
    },
    default: {},
  }),
};

// === CONFIGURATION TYPOGRAPHIQUE ===

// Configuration de typographie standardisée pour cohérence visuelle
export const typography = {
  // Tailles de police hiérarchisées
  heading1: 24,                            // Titres principaux (écrans, sections importantes)
  heading2: 20,                            // Sous-titres principaux
  heading3: 18,                            // Sous-titres secondaires
  body1: 16,                               // Texte principal (questions, contenu)
  body2: 14,                               // Texte secondaire (descriptions, labels)
  caption: 12,                             // Texte de légende (métadonnées, notes)
  button: 16,                              // Texte des boutons
  
  // Poids de police avec types TypeScript corrects
  fontWeightRegular: '400' as TextStyle['fontWeight'],  // Poids normal
  fontWeightMedium: '500' as TextStyle['fontWeight'],   // Poids moyen (emphase légère)
  fontWeightBold: '700' as TextStyle['fontWeight'],     // Poids gras (titres, boutons)
};

// === SYSTÈME D'ESPACEMENT ===

// Espacement standardisé basé sur une échelle cohérente (multiples de 4)
export const spacing = {
  xs: 4,                                   // Très petit espacement (marges internes)
  s: 8,                                    // Petit espacement (entre éléments proches)
  m: 16,                                   // Espacement moyen (standard pour la plupart des cas)
  l: 24,                                   // Grand espacement (sections, groupes)
  xl: 32,                                  // Très grand espacement (séparateurs majeurs)
  xxl: 48,                                 // Espacement extra-large (écrans, en-têtes)
} as const;

// === SYSTÈME DE BORDURES ARRONDIES ===

// Arrondis standardisés pour cohérence du design
export const borderRadius = {
  small: 4,                                // Petits arrondis (boutons texte, inputs)
  medium: 8,                               // Arrondis moyens (cartes, boutons standard)
  large: 12,                               // Grands arrondis (conteneurs principaux)
  xl: 16,                                  // Très grands arrondis (modals, sections)
  xxl: 24,                                 // Arrondis extra-larges (éléments décoratifs)
  round: 9999,                             // Complètement rond (boutons circulaires, avatars)
} as const;

// === ICONOGRAPHIE DES THÈMES D'ENTRAÎNEMENT ===

// Icônes emoji pour identifier visuellement chaque thème d'entraînement BNSSA
export const themeIcons: Record<string, string> = {
  'Connaissance du milieu': '🏊',                              // Natation pour le milieu aquatique
  'Diplômes, compétences et obligations': '🎓',               // Diplôme pour les qualifications
  'Organisation administrative': '📋',                         // Presse-papiers pour l'administration
  'Organisation de la sécurité': '🛡️',                       // Bouclier pour la sécurité
  'Surveillance et sécurité des activités spécifiques': '👁️', // Œil pour la surveillance
  'Conduite à tenir en cas d\'accident - Premiers secours': '🚑', // Ambulance pour les secours
};

// === COULEURS DES THÈMES D'ENTRAÎNEMENT ===

// Couleurs spécifiques pour chaque thème d'entraînement (améliore la reconnaissance visuelle)
export const themeColors: Record<string, string> = {
  'Connaissance du milieu': '#4CAF50',                        // Vert nature/eau
  'Diplômes, compétences et obligations': '#2196F3',         // Bleu professionnel
  'Organisation administrative': '#FF9800',                   // Orange organisation
  'Organisation de la sécurité': '#F44336',                  // Rouge sécurité/danger
  'Surveillance et sécurité des activités spécifiques': '#9C27B0', // Violet surveillance
  'Conduite à tenir en cas d\'accident - Premiers secours': '#E91E63', // Rose médical
};

// === SYSTÈME DE CACHE POUR OPTIMISATION ===

// Cache pour les thèmes afin d'éviter les recalculs répétés
const themeCache = new Map<string, AppTheme>();

// === FONCTIONS UTILITAIRES ===

/**
 * Hook optimisé pour obtenir le thème d'un écran avec mise en cache
 * Évite les recalculs répétés et améliore les performances
 * @param screenName - Nom de l'écran (route name)
 * @returns Thème configuré pour l'écran
 */
export const getThemeForScreen = (screenName: string): AppTheme => {
  // Vérification du cache en premier
  if (themeCache.has(screenName)) {
    return themeCache.get(screenName)!;
  }
  
  // Récupération du thème selon le mapping ou fallback vers 'main'
  const themeKey = screenToTheme[screenName] || 'main';
  const theme = appThemes[themeKey];
  
  // Mise en cache pour les appels futurs
  themeCache.set(screenName, theme);
  return theme;
};

/**
 * Utilitaire pour obtenir la couleur d'un thème d'entraînement
 * @param themeName - Nom du thème d'entraînement
 * @param defaultColor - Couleur par défaut si thème non trouvé
 * @returns Couleur hexadécimale du thème
 */
export const getThemeColor = (themeName: string, defaultColor: string): string => {
  return themeColors[themeName] || defaultColor;
};

/**
 * Utilitaire pour obtenir l'icône d'un thème d'entraînement
 * @param themeName - Nom du thème d'entraînement
 * @param defaultIcon - Icône par défaut si thème non trouvé
 * @returns Emoji représentant le thème
 */
export const getThemeIcon = (themeName: string, defaultIcon: string): string => {
  return themeIcons[themeName] || defaultIcon;
};