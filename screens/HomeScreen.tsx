// HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Définir les types pour les props de navigation
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
  return (
    <View style={styles.container}>
      <Image source={require('../assets/icons/logo_app_512.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>BNSSA Training</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Examen')}>
        <Text style={styles.buttonText}>Examen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Entrainement')}>
        <Text style={styles.buttonText}>Entrainement</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Historique')}>
        <Text style={styles.buttonText}>Historique</Text>
      </TouchableOpacity>
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  logo: ImageStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logo: {
    width: 128, // Ajustez la taille selon vos besoins
    height: 128,
    marginBottom: 20,
  },
});

export default HomeScreen;
