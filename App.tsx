import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importation des différentes pages (écrans) de l'application
import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import HistoricScreen from './screens/HistoricScreen';
import TrainingSession from './screens/TrainingSession';
import ExamenSession from './screens/ExamenSession';
import ExamenSessionNote from './screens/ExamenSessionNote';

// Définition de l'interface pour structurer une question
interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

// Définition des paramètres de navigation pour chaque écran
export type RootStackParamList = {
  HomeScreen: undefined; // Aucun paramètre requis
  ExamenScreen: undefined;
  TrainingScreen: undefined;
  Historique: undefined;
  TrainingSession: { selectedThemes: string[] }; // Reçoit un tableau de thèmes sélectionnés
  ExamenSession: undefined;
  ExamenSessionNote: {
    score: number;
    totalQuestions: number;
    selectedQuestions: Question[]; // Liste des questions sélectionnées
    selectedAnswers: string[][]; // Réponses sélectionnées par l'utilisateur
  };
};

// Création d'une instance du Stack Navigator avec les types définis
const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer> {/* Conteneur principal pour la navigation */}
      <Stack.Navigator>
        {/* Définition des écrans de l'application dans le stack navigator */}
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