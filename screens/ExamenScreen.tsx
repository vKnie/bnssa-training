import React, { useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  Dimensions, 
  Platform, 
  SafeAreaView,
  TextStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';

// Importation des éléments du thème
import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
  appThemes 
} from '../components/themes';

type ExamenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenScreen'>;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Interface pour le bouton
interface TouchableButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: string | number;
  iconName?: string;
}

// Composant TouchableButton pour remplacer le composant Button
const TouchableButton: React.FC<TouchableButtonProps> = ({ 
  title, 
  onPress, 
  backgroundColor, 
  textColor, 
  width = '100%', 
  iconName 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor,
          width: width as any, // Une conversion de type simple
        },
        shadowStyles.medium
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {iconName && (
          <Icon name={iconName} size={24} color={textColor} style={styles.buttonIcon} />
        )}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ExamenScreen: React.FC = () => {
  const navigation = useNavigation<ExamenScreenNavigationProp>();
  const route = useRoute();
  
  // Obtenir le thème pour cet écran
  const theme = getThemeForScreen(route.name);
  
  // Définir des valeurs par défaut pour les propriétés qui pourraient manquer
  const themeGradient = (theme as any).gradient || ['#1e3c72', '#2a5298'];
  const themeCard = (theme as any).card || '#FFFFFF';
  
  const startTraining = useCallback(() => {
    navigation.navigate('ExamenSession');
  }, [navigation]);
  
  useEffect(() => {
    navigation.setOptions({ 
      title: 'Préparation à l\'Examen',
      headerStyle: {
        backgroundColor: theme.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    });
    
    const handleBackPress = (e: any) => {
      e.preventDefault();
      navigation.navigate('HomeScreen');
    };
    
    const unsubscribe = navigation.addListener('beforeRemove', handleBackPress);
    return unsubscribe;
  }, [navigation, theme]);
  
  const rules = [
    { icon: 'timer', text: 'L\'examen dure 45 minutes.', color: theme.primary },
    { icon: 'list', text: 'Il comporte 40 questions.', color: theme.accent },
    { icon: 'help', text: 'Chaque question a entre 3 et 5 réponses possibles.', color: theme.primary },
    { icon: 'check-circle', text: 'Une réponse est correcte si toutes les bonnes réponses sont sélectionnées.', color: appThemes.main.success },
    { icon: 'cancel', text: 'Une réponse est fausse si elle est incomplète, incorrecte ou absente.', color: appThemes.main.error },
    { icon: 'star', text: 'Chaque bonne réponse vaut 1 point.', color: theme.accent },
    { icon: 'grade', text: 'L\'examen est noté sur 40 points.', color: theme.primary },
    { icon: 'thumb-up', text: 'Il faut au moins 30 points pour réussir.', color: appThemes.main.success },
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <LinearGradient
        colors={themeGradient}
        style={styles.headerGradient}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Icon name="school" size={40} color={theme.primary} style={styles.headerIcon} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            Règles de l'Examen
          </Text>
          <Text style={[styles.subtitleText, { color: theme.textLight }]}>
            Familiarisez-vous avec les critères avant de commencer
          </Text>
        </View>
        
        <View style={styles.rulesWrapper}>
          <ScrollView 
            style={styles.rulesContainer}
            contentContainerStyle={styles.rulesContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {rules.map(({ icon, text, color }, index) => (
              <View key={index} style={styles.ruleItemWrapper}>
                <View style={[styles.ruleItem, { backgroundColor: themeCard }]}>
                  <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Icon name={icon} size={24} color={color} />
                  </View>
                  <Text style={[styles.ruleText, { color: theme.text }]}>
                    {text}
                  </Text>
                </View>
              </View>
            ))}
            
            <View style={styles.tipsWrapper}>
              <View style={[styles.tipsContainer, { backgroundColor: themeCard }]}>
                <View style={styles.tipHeader}>
                  <Icon name="lightbulb" size={22} color={theme.accent} />
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
            
            {/* Espace en bas pour s'assurer que le bouton n'obstrue pas le contenu */}
            <View style={{ height: 80 }} />
          </ScrollView>
        </View>
      </View>
      
      <View style={[styles.footer, shadowStyles.large]}>
        <TouchableButton
          title="Commencer l'examen"
          onPress={startTraining}
          backgroundColor={theme.primary}
          textColor='#FFF'
          width={'90%'}
          iconName="play-arrow"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 170,
    zIndex: -1,
  },
  contentContainer: { 
    flex: 1, 
    paddingHorizontal: spacing.m, 
    paddingTop: spacing.m
  },
  header: { 
    alignItems: 'center', 
    width: '100%', 
    marginBottom: spacing.m,
    paddingVertical: spacing.s, 
  },
  headerIcon: {
    marginBottom: spacing.m,
  },
  titleText: { 
    fontSize: typography.heading1, 
    textAlign: 'center', 
    fontWeight: 'bold' as TextStyle['fontWeight'],
    marginBottom: spacing.xs
  },
  subtitleText: {
    fontSize: typography.body2,
    textAlign: 'center',
    maxWidth: '80%'
  },
  rulesWrapper: {
    flex: 1,
    width: '100%',
  },
  rulesContainer: { 
    width: '100%',
  },
  rulesContentContainer: {
    paddingHorizontal: 10, // Plus d'espace sur les côtés
    paddingTop: 8, // Espace en haut pour la première règle
    paddingBottom: 8, // Espace en bas pour cohérence
  },
  ruleItemWrapper: {
    marginBottom: spacing.s,
    borderRadius: borderRadius.large,
    // Appliquer l'ombre ici plutôt que sur ruleItem directement
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ruleItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.large,
    // L'ombre est maintenant sur le wrapper, donc on la retire d'ici
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  ruleText: { 
    fontSize: typography.body1,
    lineHeight: 20,
    flex: 1 
  },
  tipsWrapper: {
    marginTop: spacing.m, // Remplace marginVertical pour plus de contrôle
    marginBottom: spacing.m,
    borderRadius: borderRadius.large,
    // Appliquer l'ombre ici plutôt que sur tipsContainer directement
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipsContainer: {
    padding: spacing.m,
    borderRadius: borderRadius.large,
    // L'ombre est maintenant sur le wrapper, donc on la retire d'ici
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  tipTitle: {
    fontSize: typography.heading3,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    marginLeft: spacing.xs,
  },
  tipText: {
    fontSize: typography.body2,
    lineHeight: 20,
  },
  footer: { 
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  // Styles pour le bouton
  button: {
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.button,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
});

export default ExamenScreen;