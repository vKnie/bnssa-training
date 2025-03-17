import React, { useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ExamenSession: React.FC = () => {
  const navigation = useNavigation();

  const endSession = useCallback(() => {
    navigation.goBack(); // Retour à l'écran précédent
  }, [navigation]);

  useLayoutEffect(() => {
      navigation.setOptions({ title: 'Session Examen' });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session d'Examen</Text>
      <Text style={styles.description}>L'examen est en cours... Répondez attentivement aux questions.</Text>

      <TouchableOpacity style={styles.button} onPress={endSession}>
        <Text style={styles.buttonText}>Terminer l'examen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default ExamenSession;
