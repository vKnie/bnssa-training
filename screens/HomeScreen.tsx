// screens/HomeScreen.tsx
import React, { useCallback, useLayoutEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Modal,
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getThemeForScreen, spacing, typography, shadowStyles, borderRadius } from '../components/themes';
import { RootStackParamList } from '../types';

// Type pour la navigation de l'écran d'accueil
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Composant bouton de navigation mémorisé pour optimiser les performances
const NavButton: React.FC<{
  title: string;
  onPress: () => void;
  color: string;
  icon: string;
}> = React.memo(({ title, onPress, color, icon }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }, shadowStyles.medium]} 
    onPress={onPress}
    activeOpacity={0.7} // Effet de transparence au toucher
  >
    {/* Icône du bouton */}
    <Icon name={icon} size={24} color="#FFFFFF" style={styles.buttonIcon} />
    {/* Texte du bouton */}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
));

// Composant pour chaque élément de paramètre dans la modal
const SettingItem: React.FC<{
  label: string;
  value?: string;
  hasAction?: boolean;
  theme: any;
}> = ({ label, value, hasAction, theme }) => (
  <TouchableOpacity 
    style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}
    disabled={!hasAction} // Désactivé si pas d'action associée
  >
    <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
    {value ? (
      // Affichage de la valeur si présente
      <Text style={[styles.settingValue, { color: theme.textLight }]}>{value}</Text>
    ) : (
      // Icône selon le type d'action
      <Icon 
        name={hasAction ? "chevron-right" : "refresh"} 
        size={20} 
        color={theme.textLight} 
      />
    )}
  </TouchableOpacity>
);

// Modal des paramètres mémorisée pour éviter les re-renders inutiles
const SettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  theme: any;
}> = React.memo(({ visible, onClose, theme }) => {
  // Configuration des sections de paramètres
  const sections = [
    {
      title: 'Information de l\'application',
      icon: 'info',
      items: [
        { label: 'Version', value: '1.0.0' },
        { label: 'Développé par', value: 'BNSSA Team' },
      ]
    },
    {
      title: 'Données',
      icon: 'storage',
      items: [
        { label: 'Réinitialiser données d\'entraînement', hasAction: true },
        { label: 'Réinitialiser données d\'examen', hasAction: true },
      ]
    },
    {
      title: 'Support',
      icon: 'help',
      items: [
        { label: 'Centre d\'aide', hasAction: true },
        { label: 'Contactez-nous', hasAction: true },
        { label: 'Conditions d\'utilisation', hasAction: true },
      ]
    }
  ];

  return (
    <Modal
      animationType="slide" // Animation de glissement depuis le bas
      transparent // Fond transparent pour l'overlay
      visible={visible}
      onRequestClose={onClose} // Gestion du bouton retour Android
    >
      {/* Overlay sombre derrière la modal */}
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* En-tête de la modal avec titre et bouton fermer */}
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
          
          {/* Contenu scrollable de la modal */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {sections.map((section, index) => (
              <View key={index} style={styles.settingsSection}>
                {/* Titre de section avec icône */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  <Icon name={section.icon} size={20} color={theme.primary} /> {section.title}
                </Text>
                {/* Mappage des éléments de la section */}
                {section.items.map((item, itemIndex) => (
                  <SettingItem
                    key={itemIndex}
                    label={item.label}
                    value={item.value}
                    hasAction={item.hasAction}
                    theme={theme}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const HomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const theme = getThemeForScreen('home'); // Récupération du thème pour l'écran d'accueil
  const [settingsVisible, setSettingsVisible] = useState(false); // État de visibilité de la modal

  // Configuration des boutons de navigation principaux
  const buttons = [
    { title: "Examen", screen: "ExamenScreen" as const, icon: "assignment" },
    { title: "Entrainement", screen: "TrainingScreen" as const, icon: "fitness-center" },
    { title: "Historiques", screen: "HistoricScreen" as const, icon: "history" },
  ];

  // Gestionnaire de navigation optimisé avec useCallback
  const handleNavigation = useCallback((screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  }, [navigation]);

  // Configuration de l'écran au montage
  useLayoutEffect(() => {
    // Configuration de la barre de statut
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true); // Transparence de la barre de statut
      StatusBar.setBackgroundColor('transparent');
    }
    navigation.setOptions({ headerShown: false }); // Masquage de l'en-tête de navigation
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Configuration de la barre de statut */}
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Bouton paramètres positionné en absolu en haut à droite */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
        activeOpacity={0.7}
      >
        <Icon name="settings" size={28} color={theme.primary} />
      </TouchableOpacity>
      
      {/* Section d'en-tête avec logo et textes */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/icons/playstore.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={[styles.title, { color: theme.text }]}>BNSSA Training</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          Préparez-vous efficacement à l'examen du BNSSA
        </Text>
      </View>

      {/* Conteneur des boutons de navigation principaux */}
      <View style={styles.buttonContainer}>
        {buttons.map(({ title, screen, icon }) => (
          <NavButton
            key={screen}
            title={title}
            onPress={() => handleNavigation(screen)}
            color={theme.primary}
            icon={icon}
          />
        ))}
      </View>

      {/* Modal des paramètres */}
      <SettingsModal 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal centré avec padding adaptatif selon la plateforme
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0, // Gestion des zones sécurisées
  },
  // Bouton paramètres positionné en absolu avec z-index élevé
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    right: spacing.m,
    padding: spacing.s,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fond semi-transparent
    ...shadowStyles.medium,
    zIndex: 1000, // Au-dessus de tous les autres éléments
  },
  // En-tête centré avec logo et textes
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  // Logo de l'application
  logo: { 
    width: 128, 
    height: 128, 
    marginBottom: spacing.m,
  },
  // Titre principal de l'application
  title: { 
    fontSize: typography.heading1, 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs,
  },
  // Sous-titre descriptif
  subtitle: {
    fontSize: typography.body2,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  // Conteneur des boutons de navigation
  buttonContainer: { 
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  // Style des boutons de navigation avec icône et texte
  button: {
    width: 250, // Largeur fixe pour l'uniformité
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.m,
  },
  // Icône des boutons avec marge droite
  buttonIcon: {
    marginRight: spacing.s,
  },
  // Texte des boutons de navigation
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.button,
    fontWeight: typography.fontWeightBold,
  },
  
  // === Styles de la modal des paramètres ===
  
  // Overlay sombre de fond de la modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent noir
    justifyContent: 'flex-end', // Modal depuis le bas
  },
  // Conteneur principal de la modal avec coins arrondis
  modalContainer: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: '80%', // Hauteur maximale
    minHeight: '60%', // Hauteur minimale
    ...shadowStyles.large,
  },
  // En-tête de la modal avec titre et bouton fermer
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Séparateur visuel
  },
  // Titre de la modal
  modalTitle: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
  // Bouton de fermeture de la modal
  closeButton: {
    padding: spacing.xs,
  },
  // Contenu scrollable de la modal
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  // Section de paramètres avec espacement
  settingsSection: {
    marginBottom: spacing.l,
  },
  // Titre de section avec icône intégrée
  sectionTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.m,
  },
  // Élément de paramètre avec layout horizontal
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.s,
    ...shadowStyles.small,
  },
  // Label des éléments de paramètre
  settingLabel: {
    fontSize: typography.body1,
    flex: 1, // Prend l'espace disponible
  },
  // Valeur affichée pour les éléments informatifs
  settingValue: {
    fontSize: typography.body2,
  },
});

export default HomeScreen;