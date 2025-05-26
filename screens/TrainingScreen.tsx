import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Platform,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importation des éléments du thème
import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
  themeIcons,
  themeColors
} from '../components/themes';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingScreen'>;

// Interface pour le bouton
interface TouchableButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: string | number;
  iconName?: string;
  disabled?: boolean;
}

// Composant TouchableButton pour remplacer le composant Button
const TouchableButton: React.FC<TouchableButtonProps> = ({ 
  title, 
  onPress, 
  backgroundColor, 
  textColor, 
  width = '100%', 
  iconName,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor,
          width: width as any,
          opacity: disabled ? 0.7 : 1
        }
      ]} 
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled}
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

// Helper function to safely get theme color or icon
const getThemeColor = (themeName: string, defaultColor: string): string => {
  // Using type assertion to tell TypeScript this is safe
  return themeColors[themeName as keyof typeof themeColors] || defaultColor;
};

const getThemeIcon = (themeName: string, defaultIcon: string): string => {
  // Using type assertion to tell TypeScript this is safe
  return themeIcons[themeName as keyof typeof themeIcons] || defaultIcon;
};

const TrainingScreen: React.FC = () => {
  const [themes] = useState<Theme[]>(questionsData.themes);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const navigation = useNavigation<TrainingScreenNavigationProp>();
  const route = useRoute();
  
  // Obtenir le thème pour cet écran
  const theme = getThemeForScreen(route.name);
  
  // Définir des valeurs par défaut pour les propriétés qui pourraient manquer
  const themeGradient = (theme as any).gradient || ['#FF5F6D', '#FFC371'];
  const themeCard = (theme as any).card || '#FFFFFF';
  
  const isButtonDisabled = useMemo(() => selectedThemes.length === 0, [selectedThemes]);
  
  const toggleSelection = useCallback((themeName: string) => {
    setSelectedThemes(prevSelected =>
      prevSelected.includes(themeName)
        ? prevSelected.filter(name => name !== themeName)
        : [...prevSelected, themeName]
    );
  }, []);
  
  const startTraining = useCallback(() => {
    navigation.navigate('TrainingSession', { selectedThemes });
  }, [navigation, selectedThemes]);
  
  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Entraînement',
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
  
  // Obtenir le nombre total de questions pour les thèmes sélectionnés
  const totalQuestions = useMemo(() => {
    return themes
      .filter(theme => selectedThemes.includes(theme.theme_name))
      .reduce((acc, theme) => acc + theme.questions.length, 0);
  }, [themes, selectedThemes]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <LinearGradient
        colors={themeGradient}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="fitness-center" size={40} color={theme.primary} style={styles.headerIcon} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            Sélectionner les thèmes d'entraînement
          </Text>
          <Text style={[styles.descriptionText, { color: theme.textLight }]}>
            Sélectionnez au moins un thème pour commencer votre session d'entraînement
          </Text>
        </View>
        
        <View style={styles.selectionInfoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: themeCard }]}>
            <Text style={[styles.infoText, { color: theme.textLight }]}>
              Thèmes sélectionnés: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedThemes.length}</Text>
            </Text>
            {totalQuestions > 0 && (
              <Text style={[styles.infoText, { color: theme.textLight }]}>
                Questions disponibles: <Text style={{ fontWeight: 'bold', color: theme.text }}>{totalQuestions}</Text>
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.themesContainer}>
          {themes.map(({ theme_name }, index) => {
            const isSelected = selectedThemes.includes(theme_name);
            const themeColor = getThemeColor(theme_name, theme.primary);
            const themeIcon = getThemeIcon(theme_name, '📝');
            
            return (
              <View 
                key={index} 
                style={styles.themeButtonWrapper}
              >
                <View 
                  style={[
                    styles.themeButton, 
                    { 
                      backgroundColor: isSelected ? themeColor : themeCard,
                      borderWidth: 2,
                      borderColor: isSelected ? themeColor : 'transparent',
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.themeButtonTouch}
                    onPress={() => toggleSelection(theme_name)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.themeButtonText, 
                      { color: isSelected ? '#fff' : theme.text }
                    ]}>
                      {themeIcon}  {theme_name}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        
        <View style={styles.buttonWrapper}>
          <TouchableButton
            title={`Commencer l'entraînement${totalQuestions > 0 ? ` (${totalQuestions} questions)` : ''}`}
            onPress={startTraining}
            backgroundColor={isButtonDisabled ? '#ccc' : theme.primary}
            textColor={isButtonDisabled ? '#999' : '#fff'}
            width={'90%'}
            iconName="play-arrow"
            disabled={isButtonDisabled}
          />
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl * 2, // Plus d'espace en bas pour éviter les boutons du téléphone
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
    fontSize: typography.heading2, 
    textAlign: 'center', 
    fontWeight: 'bold' as TextStyle['fontWeight'],
    marginBottom: spacing.xs
  },
  descriptionText: { 
    fontSize: typography.body2, 
    textAlign: 'center', 
    marginBottom: spacing.m,
    maxWidth: '90%'
  },
  selectionInfoWrapper: {
    marginBottom: spacing.m,
    width: '100%',
    borderRadius: borderRadius.medium,
    // Appliquer l'ombre ici plutôt que sur infoCard directement
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoCard: {
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    alignItems: 'center',
  },
  infoText: {
    fontSize: typography.body2,
    marginBottom: spacing.xs,
  },
  themesContainer: {
    width: '100%',
    paddingHorizontal: 8, // Espace pour les ombres
  },
  themeButtonWrapper: {
    width: '100%',
    marginBottom: spacing.s,
    borderRadius: borderRadius.medium,
    // Appliquer l'ombre ici plutôt que sur themeButton directement
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
  themeButton: {
    width: '100%',
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  themeButtonTouch: {
    width: '100%',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: typography.body1,
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl, // Espace supplémentaire en dessous du bouton
    paddingHorizontal: spacing.m,
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

export default TrainingScreen;