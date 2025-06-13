// components/CustomHeader.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderProps } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/AntDesign';
import Svg, { Path } from 'react-native-svg';

import { getThemeForScreen, spacing, typography } from './themes';

// Récupération de la largeur d'écran pour les calculs de dimensions
const { width: screenWidth } = Dimensions.get('window');

// === CONSTANTES DE DESIGN DU HEADER ===

const CONCAVE_HEIGHT = 25;                                            // Hauteur de la courbe concave en bas du header
const TRANSPARENT_SPACE = 12;                                         // Espace transparent entre le header et le contenu
const HEADER_HEIGHT = Platform.OS === 'ios' ? 75 : (StatusBar.currentHeight || 0) + 45; // Hauteur totale adaptée selon la plateforme
const STATUS_BAR_PADDING = Platform.OS === 'ios' ? 25 : StatusBar.currentHeight || 0;   // Padding pour la status bar

// === INTERFACES ===

interface ConcaveBottomProps {
  color: string;                                                      // Couleur de la courbe concave
}

// === COMPOSANTS INTERNES ===

/**
 * Composant pour créer la forme concave en bas du header
 * Utilise SVG pour dessiner une courbe Bézier quadratique
 */
const ConcaveBottom: React.FC<ConcaveBottomProps> = React.memo(({ color }) => {
  const extraWidth = 20;                                              // Largeur supplémentaire pour éviter les espaces blancs sur les bords
  const totalWidth = screenWidth + (extraWidth * 2);                 // Largeur totale incluant les extensions

  return (
    <View style={[styles.concaveContainer, { left: -extraWidth }]}>
      <Svg 
        height={CONCAVE_HEIGHT} 
        width={totalWidth} 
        viewBox={`0 0 ${totalWidth} ${CONCAVE_HEIGHT}`} 
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Chemin SVG pour créer la courbe concave avec points de contrôle Bézier */}
        <Path
          d={`M0,0 L${totalWidth},0 L${totalWidth},${CONCAVE_HEIGHT/3} Q${totalWidth/2},${CONCAVE_HEIGHT*1.2} 0,${CONCAVE_HEIGHT/3} Z`}
          fill={color}
        />
      </Svg>
    </View>
  );
});

/**
 * Bouton de retour mémorisé pour optimiser les performances
 * Style circulaire avec fond semi-transparent
 */
const BackButton: React.FC = React.memo(() => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.backButtonContainer}
      onPress={navigation.goBack}                                     // Navigation vers l'écran précédent
      activeOpacity={0.7}                                             // Effet de transparence au toucher
    >
      <Icon name="arrowleft" size={22} color="#fff" />
    </TouchableOpacity>
  );
});

/**
 * Espace transparent entre le header et le contenu principal
 * Améliore la séparation visuelle et la lisibilité
 */
const TransparentSpace: React.FC = React.memo(() => (
  <View style={styles.transparentSpace} pointerEvents="none" />
));

/**
 * Fonction utilitaire pour obtenir le titre affiché selon la route
 * Mapping des noms techniques vers des titres utilisateur-friendly
 */
const getScreenTitle = (routeName: string): string => {
  const titles: Record<string, string> = {
    ExamenScreen: "Mode Examen",                                      // Écran de préparation à l'examen
    TrainingScreen: "Mode Entraînement",                              // Écran de sélection des thèmes d'entraînement
    HistoricScreenTraining: "Historique d'Entraînement",              // Écran d'historique des sessions
    TrainingSession: "Session d'Entraînement",                        // Écran de session d'entraînement active
    ExamenSession: "Session d'Examen",                                // Écran de session d'examen active
    ExamenSessionNote: "Résultat d'Examen"                            // Écran de résultats d'examen
  };
  
  return titles[routeName] || routeName;                              // Retourne le nom technique si pas de mapping
};

// === COMPOSANT PRINCIPAL ===

/**
 * Header personnalisé avec design curved et adaptation thématique
 * Remplace le header par défaut de React Navigation
 */
const CustomHeader: React.FC<StackHeaderProps> = ({ route, back }) => {
  // Mémoisation du thème pour éviter les recalculs
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  // Mémoisation du titre pour éviter les recalculs
  const title = useMemo(() => getScreenTitle(route.name), [route.name]);
  
  // Masquage du header pour l'écran d'accueil (design spécifique)
  if (route.name === "HomeScreen") {
    return null;
  }

  return (
    <>
      {/* Conteneur principal du header avec hauteur dynamique */}
      <View style={[styles.headerOuterContainer, { height: HEADER_HEIGHT }]}>
        {/* Configuration de la barre de statut */}
        <StatusBar 
          barStyle="light-content"                                    // Texte blanc sur fond coloré
          backgroundColor={theme.primary}                             // Couleur de fond selon le thème
          translucent={true}                                          // Permet au contenu de passer sous la status bar
        />
        
        {/* Fond coloré du header avec extension latérale */}
        <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />
        
        {/* Conteneur principal du contenu avec padding pour la status bar */}
        <View style={[styles.headerContainer, { paddingTop: STATUS_BAR_PADDING }]}>
          <View style={styles.headerContentWrapper}>
            <View style={styles.headerContent}>
              {/* Bouton de retour conditionnel */}
              {back ? (
                <BackButton />
              ) : (
                <View style={styles.placeholderButton} />             // Placeholder pour maintenir l'alignement
              )}
              
              {/* Titre principal centré avec troncature */}
              <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
              
              {/* Placeholder pour équilibrer la disposition */}
              <View style={styles.placeholderButton} />
            </View>
          </View>
        </View>
        
        {/* Forme concave en bas du header */}
        <ConcaveBottom color={theme.primary} />
      </View>
      
      {/* Espace de séparation transparent */}
      <TransparentSpace />
    </>
  );
};

const styles = StyleSheet.create({
  // Conteneur externe du header avec z-index élevé
  headerOuterContainer: {
    position: 'relative',
    zIndex: 10,                                                       // Au-dessus du contenu principal
    backgroundColor: 'transparent',
    overflow: 'visible',                                              // Permet à la courbe de dépasser
  },
  // Fond coloré étendu pour éviter les espaces blancs
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: -10,                                                        // Extension latérale
    right: -10,
    bottom: 0,
    width: screenWidth + 20,                                          // Largeur étendue
  },
  // Conteneur principal du header
  headerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  // Wrapper pour centrer le contenu verticalement
  headerContentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  // Contenu horizontal du header (bouton, titre, placeholder)
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    height: 40,
    transform: [{ translateY: 5 }],                                   // Ajustement fin de la position
  },
  // Style du titre principal
  headerTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    color: '#fff',
    textAlign: 'center',
    flex: 1,                                                          // Prend l'espace disponible
    marginHorizontal: spacing.s,
  },
  // Style du bouton de retour circulaire
  backButtonContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,                                                 // Forme circulaire
    backgroundColor: 'rgba(255, 255, 255, 0.15)',                    // Fond blanc semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Placeholder pour maintenir l'alignement symétrique
  placeholderButton: {
    width: 34,                                                        // Même largeur que le bouton de retour
  },
  // Conteneur de la forme concave positionnée en absolu
  concaveContainer: {
    position: 'absolute',
    bottom: -CONCAVE_HEIGHT + 1,                                      // Chevauchement d'1px pour éviter les gaps
    right: -10,
    backgroundColor: 'transparent',
    zIndex: 5,                                                        // Sous le contenu du header mais au-dessus du contenu principal
  },
  // Espace transparent de séparation
  transparentSpace: {
    height: TRANSPARENT_SPACE,
    backgroundColor: 'transparent',
    width: '100%',
  },
});

export default CustomHeader;