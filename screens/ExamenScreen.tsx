// screens/ExamenScreen.tsx
import React, { useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
  appThemes 
} from '../components/themes';
import TouchableButton from '../components/TouchableButton';
import { RootStackParamList } from '../types';

// Type pour la navigation de l'écran ExamenScreen
type ExamenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenScreen'>;

// Composant pour afficher chaque règle de l'examen
const RuleItem: React.FC<{
  icon: string;
  text: string;
  color: string;
  cardColor: string;
  textColor: string;
}> = ({ icon, text, color, cardColor, textColor }) => (
  <View style={styles.ruleWrapper}>
    <View style={[styles.ruleItem, { backgroundColor: cardColor }]}>
      {/* Conteneur de l'icône avec couleur de fond dynamique */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      {/* Texte de la règle */}
      <Text style={[styles.ruleText, { color: textColor }]}>{text}</Text>
    </View>
  </View>
);

const ExamenScreen: React.FC = () => {
  const navigation = useNavigation<ExamenScreenNavigationProp>();
  const route = useRoute();
  // Récupération du thème basé sur le nom de l'écran
  const theme = getThemeForScreen(route.name);
  
  // Configuration des règles de l'examen avec icônes et couleurs
  const rules = [
    { icon: 'timer', text: 'L\'examen dure 45 minutes.', color: theme.primary },
    { icon: 'list', text: 'Il comporte 40 questions.', color: theme.accent || theme.secondary },
    { icon: 'help', text: 'Chaque question a entre 3 et 5 réponses possibles.', color: theme.primary },
    { icon: 'check-circle', text: 'Une réponse est correcte si toutes les bonnes réponses sont sélectionnées.', color: appThemes.main.success },
    { icon: 'cancel', text: 'Une réponse est fausse si elle est incomplète, incorrecte ou absente.', color: appThemes.main.error },
    { icon: 'star', text: 'Chaque bonne réponse vaut 1 point.', color: theme.accent || theme.secondary },
    { icon: 'grade', text: 'L\'examen est noté sur 40 points.', color: theme.primary },
    { icon: 'thumb-up', text: 'Il faut au moins 30 points pour réussir.', color: appThemes.main.success },
  ];
  
  // Fonction pour démarrer l'examen - optimisée avec useCallback
  const startExam = useCallback(() => {
    navigation.navigate('ExamenSession');
  }, [navigation]);
  
  // Hook d'effet pour configurer l'écran au montage
  useEffect(() => {
    // Configuration du titre de l'écran
    navigation.setOptions({ title: 'Préparation à l\'Examen' });
    
    // Listener pour intercepter le retour arrière et rediriger vers l'accueil
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('HomeScreen');
    });
    
    // Nettoyage du listener au démontage
    return unsubscribe;
  }, [navigation]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Configuration de la barre de statut */}
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      {/* Gradient de fond en en-tête */}
      <LinearGradient
        colors={theme.gradient || ['#1e3c72', '#2a5298']}
        style={styles.headerGradient}
      />
      
      {/* Conteneur scrollable principal */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section d'en-tête avec titre et sous-titre */}
        <View style={styles.header}>
          <Icon name="school" size={40} color={theme.primary} style={styles.headerIcon} />
          <Text style={[styles.title, { color: theme.text }]}>
            Règles de l'Examen
          </Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>
            Familiarisez-vous avec les critères avant de commencer
          </Text>
        </View>
        
        {/* Conteneur des règles - mappage dynamique */}
        <View style={styles.rulesContainer}>
          {rules.map((rule, index) => (
            <RuleItem
              key={index}
              icon={rule.icon}
              text={rule.text}
              color={rule.color}
              cardColor={theme.card || '#FFFFFF'}
              textColor={theme.text}
            />
          ))}
        </View>
        
        {/* Section des conseils */}
        <View style={styles.tipsWrapper}>
          <View style={[styles.tipsContainer, { backgroundColor: theme.card || '#FFFFFF' }]}>
            <View style={styles.tipHeader}>
              <Icon name="lightbulb" size={22} color={theme.accent || theme.secondary} />
              <Text style={[styles.tipTitle, { color: theme.text }]}>
                Conseils pour réussir
              </Text>
            </View>
            <Text style={[styles.tipText, { color: theme.textLight }]}>
              Lisez attentivement chaque question. Gérez bien votre temps et commencez par les questions 
              dont vous êtes sûr. Vous pouvez revenir aux questions plus difficiles par la suite.
            </Text>
          </View>
        </View>
        
        {/* Bouton de démarrage de l'examen */}
        <View style={styles.buttonWrapper}>
          <TouchableButton
            title="Commencer l'examen"
            onPress={startExam}
            backgroundColor={theme.primary}
            textColor='#FFF'
            width={'95%'}
            iconName="play-arrow"
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
    zIndex: -1, // Placé derrière le contenu
  },
  // Conteneur de scroll principal
  scrollContainer: {
    flex: 1,
  },
  // Styles du contenu scrollable avec padding réduit
  scrollContent: {
    paddingHorizontal: spacing.s, // Réduit de spacing.m à spacing.s
    paddingTop: spacing.m,
    paddingBottom: spacing.xl * 2, // Espace supplémentaire en bas
  },
  // En-tête centré de l'écran
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
  // Titre principal
  title: { 
    fontSize: typography.heading1, 
    textAlign: 'center', 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs
  },
  // Sous-titre avec largeur étendue
  subtitle: {
    fontSize: typography.body2,
    textAlign: 'center',
    maxWidth: '90%' // Augmenté de 80% à 90%
  },
  // Conteneur des règles sans padding latéral
  rulesContainer: { 
    width: '100%',
    paddingHorizontal: 0, // Supprimé le padding de 10
  },
  // Wrapper de chaque règle avec ombre
  ruleWrapper: {
    marginBottom: spacing.s,
    borderRadius: borderRadius.large,
    ...shadowStyles.small,
  },
  // Style de chaque élément de règle
  ruleItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.large,
  },
  // Conteneur circulaire pour l'icône
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23, // Cercle parfait
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  // Texte des règles avec flex pour prendre l'espace restant
  ruleText: { 
    fontSize: typography.body1,
    lineHeight: 20,
    flex: 1 
  },
  // Wrapper de la section conseils avec ombre et sans margin latéral
  tipsWrapper: {
    marginTop: spacing.m,
    marginBottom: spacing.m,
    marginHorizontal: 0, // Supprimé la marge de 10
    borderRadius: borderRadius.large,
    ...shadowStyles.small,
  },
  // Conteneur des conseils
  tipsContainer: {
    padding: spacing.m,
    borderRadius: borderRadius.large,
  },
  // En-tête des conseils (icône + titre)
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  // Titre de la section conseils
  tipTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.xs,
  },
  // Texte des conseils
  tipText: {
    fontSize: typography.body2,
    lineHeight: 20,
  },
  // Wrapper du bouton centré avec padding réduit
  buttonWrapper: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.s, // Réduit de spacing.m à spacing.s
  },
});
export default ExamenScreen;