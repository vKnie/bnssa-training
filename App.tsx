import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import HistoricScreen from './screens/HistoricScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Examen" component={ExamenScreen} />
        <Stack.Screen name="Entrainement" component={TrainingScreen} />
        <Stack.Screen name="Historique" component={HistoricScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
