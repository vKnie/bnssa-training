// screens/TrainingScreen.tsx
import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import questionsData from '../assets/data/questions.json';
import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
  getThemeColor,
  getThemeIcon
} from '../components/themes';
import TouchableButton from '../components/TouchableButton';
import { RootStackParamList, Theme } from '../types';

// Type pour la navigation de l'écran d'entraînement
type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingScreen'>;

// Composant bouton de thème mémorisé avec animation améliorée
const ThemeButton: React.FC<{
  themeName: string;
  isSelected: boolean;
  onPress: () => void;
  themeColor: string;
  themeIcon: string;
  cardColor: string;
  textColor: string;
}> = React.memo(({ themeName, isSelected, onPress, themeColor, themeIcon, cardColor, textColor }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const opacityValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  return (
    <View style={styles.themeButtonWrapper}>
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        }}
      >
        <TouchableOpacity
          style={[
            styles.themeButton, 
            { 
              backgroundColor: isSelected ? themeColor : cardColor,
              borderWidth: 2,
              borderColor: isSelected ? themeColor : 'transparent',
            }
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1} // Désactivé car géré manuellement
        >
          {/* Texte avec icône du thème */}
          <Text style={[
            styles.themeButtonText, 
            { color: isSelected ? '#fff' : textColor }
          ]}>
            {themeIcon}  {themeName}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const TrainingScreen: React.FC = () => {
  // États principaux de l'écran
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]); // Thèmes sélectionnés pour l'entraînement
  const [instantAnswerMode, setInstantAnswerMode] = useState(false); // Mode réponse instantanée
  const navigation = useNavigation<TrainingScreenNavigationProp>();
  const route = useRoute();
  
  const theme = getThemeForScreen(route.name); // Récupération du thème de l'écran
  const themes = questionsData.themes; // Données des thèmes disponibles
  
  // Calcul mémorisé du nombre total de questions pour les thèmes sélectionnés
  const totalQuestions = useMemo(() => {
    return themes
      .filter(theme => selectedThemes.includes(theme.theme_name)) // Filtrage des thèmes sélectionnés
      .reduce((acc, theme) => acc + theme.questions.length, 0); // Somme des questions
  }, [selectedThemes]);
  
  // Gestionnaire de sélection/désélection des thèmes optimisé
  const toggleSelection = useCallback((themeName: string) => {
    setSelectedThemes(prev =>
      prev.includes(themeName)
        ? prev.filter(name => name !== themeName) // Retirer si déjà sélectionné
        : [...prev, themeName] // Ajouter si pas encore sélectionné
    );
  }, []);
  
  // Gestionnaire de démarrage d'entraînement avec paramètres
  const startTraining = useCallback(() => {
    navigation.navigate('TrainingSession', { 
      selectedThemes, // Thèmes sélectionnés
      instantAnswerMode // Mode de réponse
    });
  }, [navigation, selectedThemes, instantAnswerMode]);
  
  // Configuration du titre de l'écran
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Entraînement' });
  }, [navigation]);

  // Condition pour activer le bouton de démarrage
  const canStart = selectedThemes.length > 0;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Configuration de la barre de statut */}
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      {/* Gradient de fond en en-tête */}
      <LinearGradient
        colors={theme.gradient || ['#FF5F6D', '#FFC371']}
        style={styles.headerGradient}
      />
      
      {/* Conteneur scrollable principal */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section d'en-tête avec titre et description */}
        <View style={styles.header}>
          <Icon name="fitness-center" size={40} color={theme.primary} style={styles.headerIcon} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            Sélectionner les thèmes d'entraînement
          </Text>
          <Text style={[styles.descriptionText, { color: theme.textLight }]}>
            Sélectionnez au moins un thème pour commencer votre session d'entraînement
          </Text>
        </View>
        
        {/* Carte d'informations sur la sélection */}
        <View style={styles.infoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.infoText, { color: theme.textLight }]}>
              Thèmes sélectionnés: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedThemes.length}</Text>
            </Text>
            {/* Affichage conditionnel du nombre de questions */}
            {totalQuestions > 0 && (
              <Text style={[styles.infoText, { color: theme.textLight }]}>
                Questions disponibles: <Text style={{ fontWeight: 'bold', color: theme.text }}>{totalQuestions}</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Carte de configuration du mode réponses instantanées */}
        <View style={styles.infoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={styles.modeContent}>
              {/* Section texte et icône */}
              <View style={styles.modeTextContainer}>
                <Icon 
                  name={instantAnswerMode ? "flash-on" : "flash-off"} 
                  size={24} 
                  color={instantAnswerMode ? theme.primary : theme.textLight} 
                  style={styles.modeIcon}
                />
                <View style={styles.modeTexts}>
                  <Text style={[styles.modeTitle, { color: theme.text }]}>
                    Mode réponses instantanées
                  </Text>
                  {/* Description dynamique selon l'état du mode */}
                  <Text style={[styles.modeDescription, { color: theme.textLight }]}>
                    {instantAnswerMode 
                      ? "Les réponses correctes s'affichent immédiatement"
                      : "Répondez à toutes les questions avant de voir les résultats"
                    }
                  </Text>
                </View>
              </View>
              {/* Switch pour activer/désactiver le mode */}
              <Switch
                value={instantAnswerMode}
                onValueChange={setInstantAnswerMode}
                trackColor={{ 
                  false: '#E0E0E0', 
                  true: `${theme.primary}40` // Couleur semi-transparente quand activé
                }}
                thumbColor={instantAnswerMode ? theme.primary : '#FFFFFF'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
        </View>
        
        {/* Liste des thèmes disponibles */}
        <View style={styles.themesContainer}>
          {themes.map(({ theme_name }, index) => {
            const isSelected = selectedThemes.includes(theme_name);
            
            return (
              <ThemeButton
                key={theme_name}
                themeName={theme_name}
                isSelected={isSelected}
                onPress={() => toggleSelection(theme_name)}
                themeColor={getThemeColor(theme_name, theme.primary)} // Couleur spécifique au thème
                themeIcon={getThemeIcon(theme_name, '📝')} // Icône spécifique au thème
                cardColor={theme.card}
                textColor={theme.text}
              />
            );
          })}
        </View>
        
        {/* Bouton de démarrage avec état dynamique */}
        <View style={styles.buttonWrapper}>
          <TouchableButton
            title={`Commencer l'entraînement${totalQuestions > 0 ? ` (${totalQuestions} questions)` : ''}`}
            onPress={startTraining}
            backgroundColor={canStart ? theme.primary : '#ccc'} // Couleur selon la possibilité de démarrer
            textColor={canStart ? '#fff' : '#999'}
            width={'95%'}
            iconName="play-arrow"
            disabled={!canStart} // Désactivé si aucun thème sélectionné
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal - prend toute la hauteur
  container: { 
    flex: 1,
  },
  // Gradient de fond positionné en absolu
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 170,
    zIndex: -1, // Derrière le contenu
  },
  // Conteneur de scroll principal
  scrollContainer: {
    flex: 1,
  },
  // Contenu scrollable avec padding réduit
  scrollContent: {
    paddingHorizontal: spacing.s, // Réduit de spacing.m à spacing.s
    paddingTop: spacing.m,
    paddingBottom: spacing.xl * 2, // Espace supplémentaire en bas
  },
  // En-tête centré avec icône et textes
  header: { 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: spacing.m,
    paddingVertical: spacing.s, 
  },
  // Icône de l'en-tête
  headerIcon: {
    marginBottom: spacing.m,
  },
  // Titre principal de l'écran
  titleText: { 
    fontSize: typography.heading2, 
    textAlign: 'center', 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs
  },
  // Texte descriptif sous le titre avec largeur étendue
  descriptionText: { 
    fontSize: typography.body2, 
    textAlign: 'center', 
    marginBottom: spacing.m,
    maxWidth: '95%' // Augmenté de 90% à 95%
  },
  // Wrapper des cartes d'information avec ombre
  infoWrapper: {
    marginBottom: spacing.m,
    width: '100%',
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
  },
  // Carte d'information avec fond et padding
  infoCard: {
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    alignItems: 'center',
  },
  // Texte des informations
  infoText: {
    fontSize: typography.body2,
    marginBottom: spacing.xs,
  },
  // Contenu du mode (layout horizontal)
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  // Conteneur des textes et icône du mode
  modeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Prend l'espace disponible
  },
  // Icône du mode avec marge
  modeIcon: {
    marginRight: spacing.s,
  },
  // Conteneur des textes du mode
  modeTexts: {
    flex: 1,
  },
  // Titre du mode
  modeTitle: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs / 2,
  },
  // Description du mode
  modeDescription: {
    fontSize: typography.body2,
    lineHeight: 18,
  },
  // Conteneur des boutons de thèmes sans padding
  themesContainer: {
    width: '100%',
    paddingHorizontal: 0, // Supprimé le padding de 8
  },
  // Wrapper de chaque bouton de thème avec ombre
  themeButtonWrapper: {
    width: '100%',
    marginBottom: spacing.s,
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
  },
  // Style des boutons de thème
  themeButton: {
    width: '100%',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Texte des boutons de thème
  themeButtonText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  // Wrapper du bouton de démarrage centré avec padding réduit
  buttonWrapper: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.s, // Réduit de spacing.m à spacing.s
  },
});

export default TrainingScreen;