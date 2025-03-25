import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import HistoricScreen from './screens/HistoricScreen';
import TrainingSession from './screens/TrainingSession';
import ExamenSession from './screens/ExamenSession';
import ExamenSessionNote from './screens/ExamenSessionNote';

// Définir les types pour les paramètres de navigation
export type RootStackParamList = {
  HomeScreen: undefined;
  ExamenScreen: undefined;
  TrainingScreen: undefined;
  Historique: undefined;
  TrainingSession: { selectedThemes: string[] };
  ExamenSession: undefined;
  ExamenSessionNote: {
    score: number;
    totalQuestions: number;
    selectedQuestions: Question[];
    selectedAnswers: string[][];
  };
};

// Créer une instance du Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ExamenScreen" component={ExamenScreen} />
        <Stack.Screen name="TrainingScreen" component={TrainingScreen} />
        <Stack.Screen name="Historique" component={HistoricScreen} />
        <Stack.Screen name="TrainingSession" component={TrainingSession} />
        <Stack.Screen name="ExamenSession" component={ExamenSession} />
        <Stack.Screen name="ExamenSessionNote" component={ExamenSessionNote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
