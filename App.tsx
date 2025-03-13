import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import HistoricScreen from './screens/HistoricScreen';
import TrainingSession from './screens/TrainingSession';

// Définir les types pour les paramètres de navigation
export type RootStackParamList = {
  Accueil: undefined;
  Examen: undefined;
  Entrainement: undefined;
  Historique: undefined;
  TrainingSession: { selectedThemes: string[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Examen" component={ExamenScreen} />
        <Stack.Screen name="Entrainement" component={TrainingScreen} />
        <Stack.Screen name="Historique" component={HistoricScreen} />
        <Stack.Screen name="TrainingSession" component={TrainingSession} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
