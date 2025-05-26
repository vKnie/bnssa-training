import React, { useCallback, useLayoutEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Modal,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { getThemeForScreen, spacing, typography, shadowStyles, borderRadius } from '../components/themes';

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

// Composant Modal de paramètres
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, theme }) => {
  const screenHeight = Dimensions.get('window').height;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Header du modal */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Paramètres</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {/* Contenu du modal */}
          <View style={styles.modalContent}>
            {/* Section App Info */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                <Icon name="info" size={20} color={theme.primary} /> Information de l'application
              </Text>
              <View style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
                <Text style={[styles.settingValue, { color: theme.textLight }]}>1.0.0</Text>
              </View>
              <View style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Développé par</Text>
                <Text style={[styles.settingValue, { color: theme.textLight }]}>BNSSA Team</Text>
              </View>
            </View>

            {/* Section Données */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                <Icon name="storage" size={20} color={theme.primary} /> Données
              </Text>
              <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Réinitialiser données d'entraînement</Text>
                <Icon name="refresh" size={20} color={theme.textLight} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Réinitialiser données d'examen</Text>
                <Icon name="refresh" size={20} color={theme.textLight} />
              </TouchableOpacity>
            </View>

            {/* Section Support */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                <Icon name="help" size={20} color={theme.primary} /> Support
              </Text>
              <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Centre d'aide</Text>
                <Icon name="chevron-right" size={20} color={theme.textLight} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Contactez-nous</Text>
                <Icon name="chevron-right" size={20} color={theme.textLight} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Conditions d'utilisation</Text>
                <Icon name="chevron-right" size={20} color={theme.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const theme = getThemeForScreen('home'); // Utiliser le thème home pour l'écran d'accueil
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const buttons = [
    { title: "Examen", screen: "ExamenScreen", color: theme.primary, icon: "assignment" },
    { title: "Entrainement", screen: "TrainingScreen", color: theme.primary, icon: "fitness-center" },
    { title: "Historique Examen", screen: "HistoricScreenExamen", color: theme.primary, icon: "history" },
    { title: "Historique Entrainement", screen: "HistoricScreenTraining", color: theme.primary, icon: "history" },
  ];

  const handleNavigation = useCallback((screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  }, [navigation]);

  const openSettings = useCallback(() => {
    setSettingsModalVisible(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsModalVisible(false);
  }, []);

  useLayoutEffect(() => {
    // Configuration de la StatusBar en transparent
    StatusBar.setBarStyle('dark-content'); // Pour icônes noires sur fond clair
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }

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
      },
      headerShown: false, // Cacher le header pour cet écran
    });
  }, [navigation, theme]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      {/* StatusBar avec configuration spécifique pour cet écran */}
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Bouton paramètres en haut à droite */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={openSettings}
        activeOpacity={0.7}
      >
        <Icon name="settings" size={28} color={theme.primary} />
      </TouchableOpacity>
      
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

      {/* Modal de paramètres */}
      <SettingsModal 
        visible={settingsModalVisible}
        onClose={closeSettings}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0, // Ajout de paddingTop pour éviter le chevauchement avec la StatusBar
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    right: spacing.m,
    padding: spacing.s,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    zIndex: 1000,
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
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: '80%',
    minHeight: '60%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: typography.heading2,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  settingsSection: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.heading3,
    fontWeight: 'bold',
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.s,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingLabel: {
    fontSize: typography.body1,
    flex: 1,
  },
  settingValue: {
    fontSize: typography.body2,
  },
});

export default HomeScreen;