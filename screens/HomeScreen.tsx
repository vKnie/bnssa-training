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
    <View style={styles.screenContainer}>
      <Image source={require('../assets/icons/logo_app_512.png')} style={styles.appLogo} resizeMode="contain" />
      <Text style={styles.appTitle}>BNSSA Training</Text>
      <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate('Examen')}>
        <Text style={styles.buttonLabel}>Examen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate('Entrainement')}>
        <Text style={styles.buttonLabel}>Entrainement</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate('Historique')}>
        <Text style={styles.buttonLabel}>Historique</Text>
      </TouchableOpacity>
    </View>
  );
};

interface Styles {
  screenContainer: ViewStyle;
  appTitle: TextStyle;
  navigationButton: ViewStyle;
  buttonLabel: TextStyle;
  appLogo: ImageStyle;
}

const styles = StyleSheet.create<Styles>({
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appTitle: { fontSize: 20, marginBottom: 20 },
  navigationButton: { backgroundColor: '#3099EF', padding: 10, borderRadius: 5, marginVertical: 5, width: '60%', alignItems: 'center' },
  buttonLabel: { color: '#FFFFFF',  fontSize: 16 },
  appLogo: { width: 128, height: 128, marginBottom: 20 },
});

export default HomeScreen;
