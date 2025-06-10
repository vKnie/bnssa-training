// screens/ExamenScreen.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView,
  Platform
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

type ExamenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenScreen'>;

interface Rule {
  icon: string;
  text: string;
  color: string;
}

const ExamenScreen: React.FC = () => {
  const navigation = useNavigation<ExamenScreenNavigationProp>();
  const route = useRoute();
  
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  const themeGradient = useMemo(() => theme.gradient || ['#1e3c72', '#2a5298'], [theme]);
  const themeCard = useMemo(() => theme.card || '#FFFFFF', [theme]);
  
  const rules: Rule[] = useMemo(() => [
    { icon: 'timer', text: 'L\'examen dure 45 minutes.', color: theme.primary },
    { icon: 'list', text: 'Il comporte 40 questions.', color: theme.accent || theme.secondary },
    { icon: 'help', text: 'Chaque question a entre 3 et 5 réponses possibles.', color: theme.primary },
    { icon: 'check-circle', text: 'Une réponse est correcte si toutes les bonnes réponses sont sélectionnées.', color: appThemes.main.success },
    { icon: 'cancel', text: 'Une réponse est fausse si elle est incomplète, incorrecte ou absente.', color: appThemes.main.error },
    { icon: 'star', text: 'Chaque bonne réponse vaut 1 point.', color: theme.accent || theme.secondary },
    { icon: 'grade', text: 'L\'examen est noté sur 40 points.', color: theme.primary },
    { icon: 'thumb-up', text: 'Il faut au moins 30 points pour réussir.', color: appThemes.main.success },
  ], [theme]);
  
  const startTraining = useCallback(() => {
    navigation.navigate('ExamenSession');
  }, [navigation]);
  
  useEffect(() => {
    navigation.setOptions({ 
      title: 'Préparation à l\'Examen',
    });
    
    const handleBackPress = (e: any) => {
      e.preventDefault();
      navigation.navigate('HomeScreen');
    };
    
    const unsubscribe = navigation.addListener('beforeRemove', handleBackPress);
    return unsubscribe;
  }, [navigation]);
  
  const RuleItem = useCallback(({ icon, text, color }: Rule) => (
    <View style={styles.ruleItemWrapper}>
      <View style={[styles.ruleItem, { backgroundColor: themeCard }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.ruleText, { color: theme.text }]}>
          {text}
        </Text>
      </View>
    </View>
  ), [themeCard, theme.text]);
  
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
          <Icon name="school" size={40} color={theme.primary} style={styles.headerIcon} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            Règles de l'Examen
          </Text>
          <Text style={[styles.subtitleText, { color: theme.textLight }]}>
            Familiarisez-vous avec les critères avant de commencer
          </Text>
        </View>
        
        <View style={styles.rulesContainer}>
          {rules.map((rule, index) => (
            <RuleItem key={index} {...rule} />
          ))}
        </View>
        
        <View style={styles.tipsWrapper}>
          <View style={[styles.tipsContainer, { backgroundColor: themeCard }]}>
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
        
        <View style={styles.buttonWrapper}>
          <TouchableButton
            title="Commencer l'examen"
            onPress={startTraining}
            backgroundColor={theme.primary}
            textColor='#FFF'
            width={'90%'}
            iconName="play-arrow"
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
    fontSize: typography.heading1, 
    textAlign: 'center', 
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.xs
  },
  subtitleText: {
    fontSize: typography.body2,
    textAlign: 'center',
    maxWidth: '80%'
  },
  rulesContainer: { 
    width: '100%',
    paddingHorizontal: 10,
  },
  ruleItemWrapper: {
    marginBottom: spacing.s,
    borderRadius: borderRadius.large,
    ...shadowStyles.small,
  },
  ruleItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.large,
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
    marginTop: spacing.m,
    marginBottom: spacing.m,
    marginHorizontal: 10,
    borderRadius: borderRadius.large,
    ...shadowStyles.small,
  },
  tipsContainer: {
    padding: spacing.m,
    borderRadius: borderRadius.large,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  tipTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.xs,
  },
  tipText: {
    fontSize: typography.body2,
    lineHeight: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
});

export default ExamenScreen;