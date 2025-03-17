import React, { useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';

type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExamenScreen'>;

const ExamenScreen: React.FC = () => {
  const navigation = useNavigation<TrainingScreenNavigationProp>();

  const startTraining = useCallback(() => {
    navigation.navigate('ExamenSession');
  }, [navigation]);

  useLayoutEffect(() => {
      navigation.setOptions({ title: 'Examen' });
  }, [navigation]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Règles de l'Examen</Text>
      </View>
      <ScrollView style={styles.rulesContainer}>
        <View style={styles.ruleItem}>
          <Icon name="timer" size={24} color="#007AFF" />
          <Text style={styles.ruleText}>L'examen dure 45 minutes.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="list" size={24} color="#007AFF" />
          <Text style={styles.ruleText}>Il comporte 40 questions.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="help" size={24} color="#007AFF" />
          <Text style={styles.ruleText}>Chaque question a entre 3 et 5 réponses possibles.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.ruleText}>Une réponse est correcte si toutes les bonnes réponses sont sélectionnées.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="cancel" size={24} color="#FF3B30" />
          <Text style={styles.ruleText}>Une réponse est fausse si elle est incomplète, incorrecte ou absente.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="star" size={24} color="#FFD700" />
          <Text style={styles.ruleText}>Chaque bonne réponse vaut 1 point.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="grade" size={24} color="#FFD700" />
          <Text style={styles.ruleText}>L'examen est noté sur 40 points.</Text>
        </View>
        <View style={styles.ruleItem}>
          <Icon name="thumb-up" size={24} color="#4CAF50" />
          <Text style={styles.ruleText}>Il faut au moins 30 points pour réussir.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Commencer l'examen"
          onPress={startTraining}
          backgroundColor='#007AFF'
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
  ruleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  ruleText: { color: '#333', fontSize: 14, marginLeft: 10, flexShrink: 1 },
  footer: { width: '100%' },
});

export default ExamenScreen;
