// HomeScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../components/Button';

// Définition des types pour la navigation
type RootStackParamList = {
  Examen: undefined;
  Entrainement: undefined;
  Historique: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const buttons = [
    { title: "Examen", screen: "Examen", color: "#3099EF", icon: "assignment" },
    { title: "Entrainement", screen: "Entrainement", color: "#4CAF50", icon: "fitness-center" },
    { title: "Historique", screen: "Historique", color: "#FF9800", icon: "history" },
  ];

  return (
    <View style={styles.screenContainer}>
      <Image source={require('../assets/icons/logo_app_512.png')} style={styles.appLogo} resizeMode="contain" />
      <Text style={styles.appTitle}>BNSSA Training</Text>

      <View style={styles.buttonContainer}>
        {buttons.map(({ title, screen, color, icon }) => (
          <Button
            key={screen}
            title={title}
            onPress={() => navigation.navigate(screen as keyof RootStackParamList)}
            backgroundColor={color}
            textColor="#FFFFFF"
            width={250}
            iconName={icon}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appTitle: { fontSize: 20, marginBottom: 20 },
  appLogo: { width: 128, height: 128, marginBottom: 20 },
  buttonContainer: { gap: 10, alignItems: 'center' }, // Utilisation de `gap` pour espacer les boutons
});

export default HomeScreen;