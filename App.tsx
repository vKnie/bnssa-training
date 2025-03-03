import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import EntrainementScreen from './screens/EntrainementScreen';
import HistoriqueScreen from './screens/HistoriqueScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Examen" component={ExamenScreen} />
        <Stack.Screen name="Entrainement" component={EntrainementScreen} />
        <Stack.Screen name="Historique" component={HistoriqueScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
