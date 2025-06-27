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

type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingScreen'>;

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
          activeOpacity={1}
        >
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
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [instantAnswerMode, setInstantAnswerMode] = useState(false);
  const navigation = useNavigation<TrainingScreenNavigationProp>();
  const route = useRoute();
  
  const theme = getThemeForScreen(route.name);
  const themes = questionsData.themes;
  
  const totalQuestions = useMemo(() => {
    return themes
      .filter(theme => selectedThemes.includes(theme.theme_name))
      .reduce((acc, theme) => acc + theme.questions.length, 0);
  }, [selectedThemes]);
  
  const toggleSelection = useCallback((themeName: string) => {
    setSelectedThemes(prev =>
      prev.includes(themeName)
        ? prev.filter(name => name !== themeName)
        : [...prev, themeName]
    );
  }, []);
  
  const startTraining = useCallback(() => {
    navigation.navigate('TrainingSession', { 
      selectedThemes,
      instantAnswerMode
    });
  }, [navigation, selectedThemes, instantAnswerMode]);
  
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Entraînement' });
  }, [navigation]);

  const canStart = selectedThemes.length > 0;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <LinearGradient
        colors={theme.gradient || ['#FF5F6D', '#FFC371']}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
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
        
        <View style={styles.infoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
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

        <View style={styles.infoWrapper}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={styles.modeContent}>
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
                  <Text style={[styles.modeDescription, { color: theme.textLight }]}>
                    {instantAnswerMode 
                      ? "Les réponses correctes s'affichent immédiatement"
                      : "Répondez à toutes les questions avant de voir les résultats"
                    }
                  </Text>
                </View>
              </View>
              <Switch
                value={instantAnswerMode}
                onValueChange={setInstantAnswerMode}
                trackColor={{ 
                  false: '#E0E0E0', 
                  true: `${theme.primary}40`
                }}
                thumbColor={instantAnswerMode ? theme.primary : '#FFFFFF'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.themesContainer}>
          {themes.map(({ theme_name }, index) => {
            const isSelected = selectedThemes.includes(theme_name);
            
            return (
              <ThemeButton
                key={theme_name}
                themeName={theme_name}
                isSelected={isSelected}
                onPress={() => toggleSelection(theme_name)}
                themeColor={getThemeColor(theme_name, theme.primary)}
                themeIcon={getThemeIcon(theme_name, '📝')}
                cardColor={theme.card}
                textColor={theme.text}
              />
            );
          })}
        </View>
        
        <View style={styles.buttonWrapper}>
          <TouchableButton
            title={`Commencer l'entraînement${totalQuestions > 0 ? ` (${totalQuestions} questions)` : ''}`}
            onPress={startTraining}
            backgroundColor={canStart ? theme.primary : '#ccc'}
            textColor={canStart ? '#fff' : '#999'}
            width={'95%'}
            iconName="play-arrow"
            disabled={!canStart}
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
  scrollContent: {
    paddingHorizontal: spacing.s,
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
    maxWidth: '95%'
  },
  infoWrapper: {
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
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIcon: {
    marginRight: spacing.s,
  },
  modeTexts: {
    flex: 1,
  },
  modeTitle: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs / 2,
  },
  modeDescription: {
    fontSize: typography.body2,
    lineHeight: 18,
  },
  themesContainer: {
    width: '100%',
    paddingHorizontal: 0,
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
    paddingHorizontal: spacing.s,
  },
});

export default TrainingScreen;