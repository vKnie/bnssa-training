import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, StatusBar } from 'react-native';

// Importer les écrans
import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import TrainingSession from './screens/TrainingSession';
import ExamenSession from './screens/ExamenSession';
import ExamenSessionNote from './screens/ExamenSessionNote';
import HistoricScreenExamen from './screens/HistoricScreenExamen';
import HistoricScreenTraining from './screens/HistoricScreenTraining';

// Importer le thème
import { headerStyles, screenToTheme, appThemes } from './components/themes';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  theme_name: string;
}

export type RootStackParamList = {
  HomeScreen: undefined;
  ExamenScreen: undefined;
  TrainingScreen: undefined;
  HistoricScreenExamen: undefined;
  HistoricScreenTraining: undefined;
  TrainingSession: { selectedThemes: string[] };
  ExamenSession: undefined;
  ExamenSessionNote: {
    score: number;
    totalQuestions: number;
    selectedQuestions: Question[];
    selectedAnswers: string[][];
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <Icon
      name="backburger"
      size={26}
      color="#fff"
      style={{ marginLeft: 15 }}
      onPress={() => navigation.goBack()}
    />
  );
};

// Obtenir le style de header pour un écran donné
const getHeaderStyleForScreen = (screenName: string) => {
  const themeKey = screenToTheme[screenName] || 'main';
  
  return {
    ...headerStyles.common,
    headerStyle: {
      ...headerStyles.common.headerStyle,
      backgroundColor: appThemes[themeKey as keyof typeof appThemes].primary,
    },
  };
};

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={({ route }) => ({
          ...getHeaderStyleForScreen(route.name),
          headerLeft: () => <BackButton />,
        })}
      >
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="ExamenScreen" 
          component={ExamenScreen} 
        />
        
        <Stack.Screen 
          name="TrainingScreen" 
          component={TrainingScreen} 
        />
        
        <Stack.Screen
          name="HistoricScreenExamen"
          component={HistoricScreenExamen}
        />
        
        <Stack.Screen
          name="HistoricScreenTraining"
          component={HistoricScreenTraining}
        />
        
        <Stack.Screen 
          name="TrainingSession" 
          component={TrainingSession} 
        />
        
        <Stack.Screen 
          name="ExamenSession" 
          component={ExamenSession} 
        />
        
        <Stack.Screen 
          name="ExamenSessionNote" 
          component={ExamenSessionNote} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;