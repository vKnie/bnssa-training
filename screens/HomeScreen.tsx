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
  Dimensions,
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';

import { getThemeForScreen, spacing, typography, shadowStyles, borderRadius } from '../components/themes';
import TouchableButton from '../components/TouchableButton';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface NavButtonProps {
  title: string;
  onPress: () => void;
  color: string;
  icon: string;
}

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

const NavButton: React.FC<NavButtonProps> = React.memo(({ title, onPress, color, icon }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }, shadowStyles.medium]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.buttonContent}>
      <Icon name={icon} size={24} color="#FFFFFF" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>{title}</Text>
    </View>
  </TouchableOpacity>
));

const SettingsModal: React.FC<SettingsModalProps> = React.memo(({ visible, onClose, theme }) => {
  const settingSections = useMemo(() => [
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
  ], []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
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
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {settingSections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  <Icon name={section.icon} size={20} color={theme.primary} /> {section.title}
                </Text>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex}
                    style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}
                    disabled={!item.hasAction}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    {item.value ? (
                      <Text style={[styles.settingValue, { color: theme.textLight }]}>
                        {item.value}
                      </Text>
                    ) : (
                      <Icon 
                        name={item.hasAction ? "chevron-right" : "refresh"} 
                        size={20} 
                        color={theme.textLight} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const theme = useMemo(() => getThemeForScreen('home'), []);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const buttons = useMemo(() => [
    { title: "Examen", screen: "ExamenScreen" as const, color: theme.primary, icon: "assignment" },
    { title: "Entrainement", screen: "TrainingScreen" as const, color: theme.primary, icon: "fitness-center" },
    { title: "Historique Entrainement", screen: "HistoricScreenTraining" as const, color: theme.primary, icon: "history" },
  ], [theme.primary]);

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
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }

    navigation.setOptions({ 
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={openSettings}
        activeOpacity={0.7}
      >
        <Icon name="settings" size={28} color={theme.primary} />
      </TouchableOpacity>
      
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/icons/logo_app_512.png')} 
          style={styles.appLogo} 
          resizeMode="contain" 
        />
        <Text style={[styles.appTitle, { color: theme.text }]}>BNSSA Training</Text>
        <Text style={[styles.appSubtitle, { color: theme.textLight }]}>
          Préparez-vous efficacement à l'examen du BNSSA
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {buttons.map(({ title, screen, color, icon }) => (
          <NavButton
            key={screen}
            title={title}
            onPress={() => handleNavigation(screen)}
            color={color}
            icon={icon}
          />
        ))}
      </View>

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
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    right: spacing.m,
    padding: spacing.s,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...shadowStyles.medium,
    zIndex: 1000,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appTitle: { 
    fontSize: typography.heading1, 
    fontWeight: typography.fontWeightBold,
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
    borderRadius: borderRadius.medium,
    marginBottom: spacing.m,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.button,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
  // Modal styles
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
    ...shadowStyles.large,
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
    fontWeight: typography.fontWeightBold,
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
    fontWeight: typography.fontWeightBold,
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
    ...shadowStyles.small,
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