import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  navigation.setOptions({ title: 'Accueil Historique' });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez une page</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('HistoricScreenExamen')}
      >
        <Text style={styles.buttonText}>Historique du mode Examen</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('HistoricScreenTraining')}
      >
        <Text style={styles.buttonText}>Historique du mode Entraînement</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#3099EF', padding: 15, borderRadius: 5, marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;
