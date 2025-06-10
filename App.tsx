import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, StackHeaderProps } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/AntDesign';
import { Platform, StatusBar, View, Text, StyleSheet, Dimensions, ScaledSize, EmitterSubscription } from 'react-native';
import Svg, { Path } from 'react-native-svg';
// Importer les écrans
import HomeScreen from './screens/HomeScreen';
import ExamenScreen from './screens/ExamenScreen';
import TrainingScreen from './screens/TrainingScreen';
import TrainingSession from './screens/TrainingSession';
import ExamenSession from './screens/ExamenSession';
import ExamenSessionNote from './screens/ExamenSessionNote';
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

// Types pour les composants personnalisés
interface ConcaveBottomProps {
  color: string;
}

// Pour éviter les erreurs concernant les propriétés Dimensions.addEventListener/removeEventListener
const useDimensionsListener = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setScreenWidth(window.width);
    };
    
    // Utilisation de EmitterSubscription comme type de retour pour éviter l'erreur
    let subscription: EmitterSubscription | { remove: () => void };
    
    // Dans les versions récentes de React Native
    try {
      subscription = Dimensions.addEventListener('change', onChange);
    } catch (e) {
      // Dans les versions plus anciennes (fallback)
      // @ts-ignore - Ignorer l'erreur TypeScript car c'est pour la rétrocompatibilité
      Dimensions.addEventListener('change', onChange);
    }
    
    return () => {
      // Vérifier si subscription existe et a une méthode remove
      if (subscription && typeof subscription === 'object' && 'remove' in subscription) {
        subscription.remove();
      } else {
        // Fallback pour les anciennes versions de React Native
        try {
          // @ts-ignore - Ignorer l'erreur TypeScript
          Dimensions.removeEventListener('change', onChange);
        } catch (e) {
          // Silencieux en cas d'échec - la rétrocompatibilité n'est pas garantie
        }
      }
    };
  }, []);
  
  return screenWidth;
};

// Composant pour le bouton de retour personnalisé
const BackButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.backButtonContainer}>
      <Icon
        name="arrowleft"
        size={22}
        color="#fff"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

// Fonction pour déterminer le titre à afficher
const getScreenTitle = (routeName: string): string => {
  const titles: Record<string, string> = {
    ExamenScreen: "Mode Examen",
    TrainingScreen: "Mode Entraînement",
    HistoricScreenExamen: "Historique des Examens",
    HistoricScreenTraining: "Historique d'Entraînement",
    TrainingSession: "Session d'Entraînement",
    ExamenSession: "Session d'Examen",
    ExamenSessionNote: "Résultat d'Examen"
  };
  
  return titles[routeName] || routeName;
};

// Constantes pour les dimensions
const CONCAVE_HEIGHT = 25;
const TRANSPARENT_SPACE = 12;
const HEADER_CONTENT_BOTTOM_MARGIN = 0; // Réduit à 0 car nous utilisons un positionnement différent
const ELEMENT_VERTICAL_OFFSET = 5; // Décalage vers le bas pour les éléments du header

// Composant pour le bord concave du header avec correction des côtés
const ConcaveBottom: React.FC<ConcaveBottomProps> = ({ color }) => {
  const height = CONCAVE_HEIGHT;
  // Utiliser notre hook personnalisé qui gère correctement les dimensions
  const screenWidth = useDimensionsListener();
  
  // Ajouter une extension pour couvrir les bords
  const extraWidth = 20; // Extension de chaque côté augmentée pour être sûr
  const totalWidth = screenWidth + (extraWidth * 2);
  
  return (
    <View style={[styles.concaveContainer, { left: -extraWidth }]}>
      <Svg 
        height={height} 
        width={totalWidth} 
        viewBox={`0 0 ${totalWidth} ${height}`} 
        style={{ backgroundColor: 'transparent' }}
      >
        <Path
          d={`M0,0 L${totalWidth},0 L${totalWidth},${height/3} Q${totalWidth/2},${height*1.2} 0,${height/3} Z`}
          fill={color}
        />
      </Svg>
    </View>
  );
};

// Composant pour l'espace transparent après l'effet concave
const TransparentSpace: React.FC = () => (
  <View style={styles.transparentSpace} pointerEvents="none" />
);

// Définir un type strict pour les props du CustomHeader
interface CustomHeaderProps {
  route: { name: string };
  options?: StackNavigationOptions;
  back?: { title?: string; } | undefined;
}

// Hauteurs personnalisées pour le header selon la plateforme
const HEADER_HEIGHT = Platform.OS === 'ios' ? 75 : (StatusBar.currentHeight || 0) + 45;
const STATUS_BAR_PADDING = Platform.OS === 'ios' ? 25 : StatusBar.currentHeight || 0;

// Header personnalisé optimisé avec correction des bordures
const CustomHeader: React.FC<CustomHeaderProps> = ({ route, back }) => {
  if (route.name === "HomeScreen") return null;
  
  const themeKey = screenToTheme[route.name] || 'main';
  const backgroundColor = appThemes[themeKey as keyof typeof appThemes].primary;
  const title = getScreenTitle(route.name);

  return (
    <>
      <View style={[styles.headerOuterContainer, { height: HEADER_HEIGHT }]}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={backgroundColor} 
          translucent={true}
        />
        {/* Extension du header pour couvrir complètement les côtés */}
        <View style={[styles.headerBackground, { backgroundColor }]} />
        
        {/* Approche utilisant un conteneur flexible pour positionner le contenu */}
        <View style={[styles.headerContainer, { paddingTop: STATUS_BAR_PADDING }]}>
          <View style={[styles.headerContentWrapper, { paddingBottom: HEADER_CONTENT_BOTTOM_MARGIN }]}>
            {/* Utilisation d'un positionnement absolue pour abaisser les éléments */}
            <View style={[styles.headerContent, { transform: [{ translateY: ELEMENT_VERTICAL_OFFSET }] }]}>
              {back ? (
                <BackButton />
              ) : (
                <View style={styles.placeholderButton} />
              )}
              <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
              <View style={styles.placeholderButton} />
            </View>
          </View>
        </View>
        <ConcaveBottom color={backgroundColor} />
      </View>
      {/* Espace transparent après l'effet concave */}
      <TransparentSpace />
    </>
  );
};

const statusBarHeight = StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  headerOuterContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'transparent',
    overflow: 'visible',
    marginTop: 0,
    paddingTop: 0,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: -10,
    right: -10,
    bottom: 0,
    width: Dimensions.get('window').width + 20,
  },
  headerContainer: {
    paddingBottom: 0,
    width: '100%',
    position: 'relative',
    height: '100%', // Utiliser toute la hauteur
  },
  // Nouveau conteneur flexible pour le positionnement
  headerContentWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center', // Centre verticalement
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  backButtonContainer: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 36,
  },
  concaveContainer: {
    position: 'absolute',
    bottom: -CONCAVE_HEIGHT + 1,
    right: -10,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  // Espace transparent après l'effet concave
  transparentSpace: {
    height: TRANSPARENT_SPACE,
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 0,
  },
  // Styles pour les contenus des écrans
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    paddingTop: 0,
    marginTop: 0,
  },
});

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar 
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          header: (props: StackHeaderProps) => <CustomHeader 
            route={props.route}
            back={props.back}
          />,
          // Désactiver tous les espacements et marges
          headerShown: true,
          cardStyle: {
            backgroundColor: '#f8f9fa',
            margin: 0,
            padding: 0,
          },
          // Désactiver la bordure du header et tout espace
          headerStyle: { 
            elevation: 0, 
            shadowOpacity: 0,
            borderBottomWidth: 0,
            height: 'auto',
          },
          // Animation
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 },
            },
            close: {
              animation: 'timing',
              config: { duration: 300 },
            },
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1],
                }),
              },
            };
          },
        }}
      >
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ExamenScreen" component={ExamenScreen} />
        <Stack.Screen name="TrainingScreen" component={TrainingScreen} />
        <Stack.Screen name="TrainingSession" component={TrainingSession} />
        <Stack.Screen name="ExamenSession" component={ExamenSession} />
        <Stack.Screen name="ExamenSessionNote" component={ExamenSessionNote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrapper pour les écrans pour assurer une marge cohérente
export const ScreenWrapper: React.FC<{children: React.ReactNode, style?: any}> = ({ children, style = {} }) => {
  return (
    <View style={[styles.screenContent, style]}>
      {children}
    </View>
  );
};

export default App;