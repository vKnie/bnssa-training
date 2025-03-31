import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';

type ExamenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenScreen'>;

const ExamenScreen: React.FC = () => {
  const navigation = useNavigation<ExamenScreenNavigationProp>();

  const startTraining = useCallback(() => {
    navigation.navigate('ExamenSession');
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({ title: 'Accueil Examen' });

    const handleBackPress = (e: any) => {
      e.preventDefault();
      navigation.navigate('HomeScreen');
    };

    const unsubscribe = navigation.addListener('beforeRemove', handleBackPress);
    return unsubscribe;
  }, [navigation]);

  const rules = [
    { icon: 'timer', text: 'L\'examen dure 45 minutes.', color: '#007AFF' },
    { icon: 'list', text: 'Il comporte 40 questions.', color: '#007AFF' },
    { icon: 'help', text: 'Chaque question a entre 3 et 5 réponses possibles.', color: '#007AFF' },
    { icon: 'check-circle', text: 'Une réponse est correcte si toutes les bonnes réponses sont sélectionnées.', color: '#4CAF50' },
    { icon: 'cancel', text: 'Une réponse est fausse si elle est incomplète, incorrecte ou absente.', color: '#FF3B30' },
    { icon: 'star', text: 'Chaque bonne réponse vaut 1 point.', color: '#FFD700' },
    { icon: 'grade', text: 'L\'examen est noté sur 40 points.', color: '#FFD700' },
    { icon: 'thumb-up', text: 'Il faut au moins 30 points pour réussir.', color: '#4CAF50' },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Règles de l'Examen</Text>
      </View>
      <ScrollView style={styles.rulesContainer}>
        {rules.map(({ icon, text, color }, index) => (
          <View key={index} style={styles.ruleItem}>
            <Icon name={icon} size={24} color={color} />
            <Text style={styles.ruleText}>{text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Commencer l'examen"
          onPress={startTraining}
          backgroundColor='#3099EF'
          textColor='#FFF'
          width={'100%'}
          iconName="play-arrow"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#F9F9F9' },
  header: { alignItems: 'center', width: '100%', marginBottom: 20 },
  titleText: { color: '#333', fontSize: 24, textAlign: 'center', fontWeight: 'bold' },
  rulesContainer: { width: '100%', padding: 10 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3, },
  ruleText: { color: '#333', fontSize: 14, marginLeft: 10, flexShrink: 1 },
  footer: { width: '100%' },
});

export default ExamenScreen;
