// screens/HomeScreen.tsx
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
  ScrollView,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getThemeForScreen, spacing, typography, shadowStyles, borderRadius } from '../components/themes';
import { RootStackParamList } from '../types';
import { databaseService } from '../services/DatabaseService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NavButton: React.FC<{
  title: string;
  onPress: () => void;
  color: string;
  icon: string;
}> = React.memo(({ title, onPress, color, icon }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }, shadowStyles.medium]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name={icon} size={24} color="#FFFFFF" style={styles.buttonIcon} />
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
));

const SettingItem: React.FC<{
  label: string;
  value?: string;
  hasAction?: boolean;
  onPress?: () => void;
  theme: any;
}> = ({ label, value, hasAction, onPress, theme }) => (
  <TouchableOpacity 
    style={[styles.settingItem, { backgroundColor: theme.card || '#f5f5f5' }]}
    disabled={!hasAction}
    onPress={onPress}
    activeOpacity={hasAction ? 0.7 : 1}
  >
    <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
    {value ? (
      <Text style={[styles.settingValue, { color: theme.textLight }]}>{value}</Text>
    ) : (
      <Icon 
        name={hasAction ? "chevron-right" : "refresh"} 
        size={20} 
        color={theme.textLight} 
      />
    )}
  </TouchableOpacity>
);

const ContactInfo: React.FC<{ theme: any }> = ({ theme }) => (
  <View style={[styles.contactContainer, { backgroundColor: theme.card || '#f5f5f5' }]}>
    <Text style={[styles.contactLabel, { color: theme.text }]}>Contactez-nous :</Text>
    <Text style={[styles.emailText, { color: theme.primary }]}>kevin.boillon@free.fr</Text>
    <Text style={[styles.emailText, { color: theme.primary }]}>kelyfane@gmail.com</Text>
  </View>
);

const SettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  theme: any;
  onResetExamData: () => void;
}> = React.memo(({ visible, onClose, theme, onResetExamData }) => {
  const sections = [
    {
      title: 'Information de l\'application',
      icon: 'info',
      items: [
        { label: 'Version', value: '2.1.0' },
        { label: 'Développé par', value: 'BNSSA Team' },
      ]
    },
    {
      title: 'Données',
      icon: 'storage',
      items: [
        { 
          label: 'Réinitialiser données d\'examen', 
          hasAction: true,
          onPress: onResetExamData
        },
      ]
    },
    {
      title: 'Support',
      icon: 'help',
      items: [],
    }
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Paramètres</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {sections.map((section, index) => (
              <View key={index} style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  <Icon name={section.icon} size={20} color={theme.primary} /> {section.title}
                </Text>
                
                {section.title !== 'Support' && section.items.map((item, itemIndex) => (
                  <SettingItem
                    key={itemIndex}
                    label={item.label}
                    value={item.value}
                    hasAction={item.hasAction}
                    onPress={item.onPress}
                    theme={theme}
                  />
                ))}
                
                {section.title === 'Support' && <ContactInfo theme={theme} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const HomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const theme = getThemeForScreen('home');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const buttons = [
    { title: "Examen", screen: "ExamenScreen" as const, icon: "assignment" },
    { title: "Entrainement", screen: "TrainingScreen" as const, icon: "fitness-center" },
    { title: "Historiques", screen: "HistoricScreen" as const, icon: "history" },
  ];

  const handleNavigation = useCallback((screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  }, [navigation]);

  const handleResetExamData = useCallback(async () => {
    Alert.alert(
      'Réinitialiser les données d\'examen',
      'Cette action supprimera définitivement toutes vos données d\'examen (historique, scores, statistiques). Cette action est irréversible.\n\nÊtes-vous absolument sûr de vouloir continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            try {
              setSettingsVisible(false);
              await databaseService.initDatabase();
              await databaseService.clearAllData();
              Alert.alert(
                'Réinitialisation terminée',
                'Toutes les données d\'examen ont été supprimées avec succès.',
                [{ text: 'OK', onPress: () => console.log('Données d\'examen réinitialisées') }]
              );
            } catch (error) {
              console.error('Erreur lors de la réinitialisation:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la réinitialisation des données. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  }, []);

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
        activeOpacity={0.7}
      >
        <Icon name="settings" size={28} color={theme.primary} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Image 
          source={require('../assets/icons/playstore.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={[styles.title, { color: theme.text }]}>BNSSA Training</Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          Préparez-vous efficacement à l'examen du BNSSA "Brevet National de Sécurité et de Sauvetage Aquatique"
        </Text>
      </View>

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

      <SettingsModal 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        theme={theme}
        onResetExamData={handleResetExamData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
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
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: { 
    width: 128, 
    height: 128, 
    marginBottom: spacing.m,
  },
  title: { 
    fontSize: typography.heading1, 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body2,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  buttonContainer: { 
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.m,
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.button,
    fontWeight: typography.fontWeightBold,
  },
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
  contactContainer: {
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.s,
    ...shadowStyles.small,
  },
  contactLabel: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.s,
  },
  emailText: {
    fontSize: typography.body2,
    marginBottom: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default HomeScreen;