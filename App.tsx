// App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, StackHeaderProps } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import TrainingSession from './screens/TrainingSession';
import ExamenSession from './screens/ExamenSession';
import ExamenSessionNote from './screens/ExamenSessionNote';
import HistoricScreen from './screens/HistoricScreen';
import CustomHeader from './components/CustomHeader';
import { RootStackParamList } from './types/index';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };
    prepareApp();
  }, []);

  const screenOptions = useCallback((): StackNavigationOptions => ({
    header: (props: StackHeaderProps) => <CustomHeader {...props} />,
    headerShown: true,
    cardStyle: { backgroundColor: '#f8f9fa' },
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: { animation: 'timing', config: { duration: 300 } },
      close: { animation: 'timing', config: { duration: 300 } },
    },
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [{
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        }],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
        }),
      },
    }),
  }), []);

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={screenOptions}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ExamenScreen" component={ExamenScreen} options={{ title: 'Mode Examen' }} />
        <Stack.Screen name="TrainingScreen" component={TrainingScreen} options={{ title: 'Mode Entraînement' }} />
        <Stack.Screen name="TrainingSession" component={TrainingSession} options={{ title: 'Session d\'Entraînement' }} />
        <Stack.Screen name="ExamenSession" component={ExamenSession} options={{ title: 'Session d\'Examen' }} />
        <Stack.Screen name="ExamenSessionNote" component={ExamenSessionNote} options={{ title: 'Résultat d\'Examen' }} />
        <Stack.Screen name="HistoricScreen" component={HistoricScreen} options={{ title: 'Historique des Examens' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;