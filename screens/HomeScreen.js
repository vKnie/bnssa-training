import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Bienvenue sur l'App BNSSA</Text>
      
      <Button title="Examen" onPress={() => navigation.navigate('Examen')} />
      <Button title="Entrainement" onPress={() => navigation.navigate('Entrainement')} />
      <Button title="Historique" onPress={() => navigation.navigate('Historique')} />
    </View>
  );
}
