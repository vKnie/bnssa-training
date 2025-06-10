// screens/TrainingScreen.tsx
import React, { useState, useCallback, useMemo, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TouchableOpacity
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

type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingScreen'>;

interface ThemeButtonProps {
  themeName: string;
  isSelected: boolean;
  onPress: () => void;
  themeColor: string;
  themeIcon: string;
  cardColor: string;
  textColor: string;
}

const ThemeButton: React.FC<ThemeButtonProps> = React.memo(({
  themeName,
  isSelected,
  onPress,
  themeColor,
  themeIcon,
  cardColor,
  textColor,
}) => (
  <View style={styles.themeButtonWrapper}>
    <View 
      style={[
        styles.themeButton, 
        { 
          backgroundColor: isSelected ? themeColor : cardColor,
          borderWidth: 2,
          borderColor: isSelected ? themeColor : 'transparent',
        }
      ]}
    >
      <TouchableOpacity
        style={styles.themeButtonTouch}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.themeButtonText, 
          { color: isSelected ? '#fff' : textColor }
        ]}>
          {themeIcon}  {themeName}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
));

const TrainingScreen: React.FC = () => {
  const [themes] = useState<Theme[]>(questionsData.themes);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const navigation = useNavigation<TrainingScreenNavigationProp>();
  const route = useRoute();
  
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  const themeGradient = useMemo(() => theme.gradient || ['#FF5F6D', '#FFC371'], [theme]);
  const themeCard = useMemo(() => theme.card || '#FFFFFF', [theme]);
  
  const isButtonDisabled = useMemo(() => selectedThemes.length === 0, [selectedThemes]);
  
  const totalQuestions = useMemo(() => {
    return themes
      .filter(theme => selectedThemes.includes(theme.theme_name))
      .reduce((acc, theme) => acc + theme.questions.length, 0);
  }, [themes, selectedThemes]);
  
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
    });
  }, [navigation]);
  
  const InfoCard = useMemo(() => (
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
  ), [themeCard, theme.textLight, theme.text, selectedThemes.length, totalQuestions]);
  
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
        
        {InfoCard}
        
        <View style={styles.themesContainer}>
          {themes.map(({ theme_name }, index) => {
            const isSelected = selectedThemes.includes(theme_name);
            const themeColor = getThemeColor(theme_name, theme.primary);
            const themeIcon = getThemeIcon(theme_name, '📝');
            
            return (
              <ThemeButton
                key={index}
                themeName={theme_name}
                isSelected={isSelected}
                onPress={() => toggleSelection(theme_name)}
                themeColor={themeColor}
                themeIcon={themeIcon}
                cardColor={themeCard}
                textColor={theme.text}
              />
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
    paddingBottom: spacing.xl * 2,
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
    fontWeight: typography.fontWeightBold,
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
    ...shadowStyles.small,
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
    paddingHorizontal: 8,
  },
  themeButtonWrapper: {
    width: '100%',
    marginBottom: spacing.s,
    borderRadius: borderRadius.medium,
    ...shadowStyles.small,
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
    fontWeight: typography.fontWeightBold,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
});

export default TrainingScreen;