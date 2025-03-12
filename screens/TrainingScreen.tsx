import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import { RootStackParamList } from '../App'; // Importer le type depuis App.tsx
import { StackNavigationProp } from '@react-navigation/stack';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

type TrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Entrainement'>;

const TrainingScreen: React.FC = () => {
  const [themes] = useState<Theme[]>(questionsData.themes);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const animationHeight = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<TrainingScreenNavigationProp>();

  const { height: screenHeight } = Dimensions.get('window');
  const maxDropdownHeight = screenHeight * 0.5;
  const itemHeight = 50;

  const toggleDropdown = () => {
    const newState = !isExpanded;
    const calculatedHeight = newState ? Math.min(themes.length * itemHeight, maxDropdownHeight) : 0;

    Animated.timing(animationHeight, {
      toValue: calculatedHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsExpanded(newState);
  };

  const toggleSelection = (themeName: string) => {
    setSelectedThemes(prevSelected =>
      prevSelected.includes(themeName)
        ? prevSelected.filter(name => name !== themeName)
        : [...prevSelected, themeName]
    );
  };

  const isButtonDisabled = selectedThemes.length === 0;

  const startTraining = () => {
    navigation.navigate('TrainingSession', { selectedThemes });
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.titleText}>Sélectionner les thèmes</Text>
      <Text style={styles.descriptionText}>*Sélectionner au moins un thème pour commencer un entraînement.</Text>

      <TouchableOpacity style={styles.dropdownToggleButton} onPress={toggleDropdown}>
        <Text style={styles.dropdownToggleText}>{isExpanded ? "Réduire" : "Déployer"}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownListContainer, { height: animationHeight }]}>
        <View style={styles.themeListBox}>
          {themes.map(({ theme_name }, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleSelection(theme_name)}
              style={[styles.themeItemContainer, selectedThemes.includes(theme_name) && styles.themeItemSelected]}
            >
              <Text style={styles.themeItemText}>{theme_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <TouchableOpacity
        style={[styles.startButton, isButtonDisabled && styles.startButtonDisabled]}
        onPress={startTraining}
        disabled={isButtonDisabled}
      >
        <Text style={[styles.startButtonText, isButtonDisabled && styles.startButtonTextDisabled]}>Commencer l'entraînement</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'center' },
  titleText: { color: '#000', fontSize: 20, textAlign: 'center' },
  startButton: { backgroundColor: '#3099EF', padding: 10, borderRadius: 5, marginVertical: 5, width: '100%', alignItems: 'center' },
  startButtonDisabled: { backgroundColor: '#ccc' },
  startButtonText: { color: '#FFFFFF', fontSize: 16 },
  startButtonTextDisabled: { color: '#999' },
  descriptionText: { color: '#000', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  dropdownToggleButton: { width: '100%', padding: 10, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', elevation: 3 },
  dropdownToggleText: { color: '#000', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  dropdownListContainer: { overflow: 'hidden', width: '100%', borderRadius: 5, marginTop: 10 },
  themeListBox: { backgroundColor: '#ffffff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', elevation: 3 },
  themeItemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  themeItemText: { fontSize: 16, paddingHorizontal: 10 },
  themeItemSelected: { backgroundColor: '#289938' },
  selectedThemesText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: '#333' },
});

export default TrainingScreen;
