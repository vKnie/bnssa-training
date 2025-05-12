import React, { useCallback, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { getThemeForScreen, spacing, typography, shadowStyles } from '../components/themes';

// Définition des types pour la navigation
type RootStackParamList = {
  ExamenScreen: undefined;
  TrainingScreen: undefined;
  HistoricScreenExamen: undefined;
  HistoricScreenTraining: undefined;
  HomeScreen: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Type pour les boutons de navigation
interface NavButtonProps {
  title: string;
  onPress: () => void;
  color: string;
  icon: string;
}

// Composant TouchableButton pour remplacer le composant Button
const TouchableButton: React.FC<NavButtonProps> = ({ title, onPress, color, icon }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: color },
        shadowStyles.medium
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <Icon name={icon} size={24} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const theme = getThemeForScreen('home'); // Utiliser le thème home pour l'écran d'accueil

  const buttons = [
    { title: "Examen", screen: "ExamenScreen", color: theme.primary, icon: "assignment" },
    { title: "Entrainement", screen: "TrainingScreen", color: theme.primary, icon: "fitness-center" },
    { title: "Historique Examen", screen: "HistoricScreenExamen", color: theme.primary, icon: "history" },
    { title: "Historique Entrainement", screen: "HistoricScreenTraining", color: theme.primary, icon: "history" },
  ];

  const handleNavigation = useCallback((screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Accueil',
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
  }, [navigation, theme]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/icons/logo_app_512.png')} style={styles.appLogo} resizeMode="contain" />
        <Text style={[styles.appTitle, { color: theme.text }]}>BNSSA Training</Text>
        <Text style={[styles.appSubtitle, { color: theme.textLight }]}>
          Préparez-vous efficacement à l'examen du BNSSA
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {buttons.map(({ title, screen, color, icon }) => (
          <TouchableButton
            key={screen}
            title={title}
            onPress={() => handleNavigation(screen as keyof RootStackParamList)}
            color={color}
            icon={icon}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appTitle: { 
    fontSize: typography.heading1, 
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    fontSize: typography.body2,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  appLogo: { 
    width: 128, 
    height: 128, 
    marginBottom: spacing.m,
  },
  buttonContainer: { 
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: 250,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 10,
    marginBottom: spacing.m,
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
    color: '#FFFFFF',
    fontSize: typography.button,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
});

export default HomeScreen;