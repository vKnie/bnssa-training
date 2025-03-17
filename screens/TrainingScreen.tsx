import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import questionsData from '../assets/data/questions.json';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../components/Button';

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
  const navigation = useNavigation<TrainingScreenNavigationProp>();

  const isButtonDisabled = selectedThemes.length === 0;

  const toggleSelection = (themeName: string) => {
    setSelectedThemes(prevSelected =>
      prevSelected.includes(themeName)
        ? prevSelected.filter(name => name !== themeName)
        : [...prevSelected, themeName]
    );
  };

  const startTraining = () => {
    navigation.navigate('TrainingSession', { selectedThemes });
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Sélectionner les thèmes</Text>
        <Text style={styles.descriptionText}>*Sélectionner au moins un thème pour commencer un entraînement.</Text>
      </View>

      <View style={styles.buttonContainer}>
        {themes.map(({ theme_name }, index) => (
          <Button
            key={index}
            title={theme_name}
            onPress={() => toggleSelection(theme_name)}
            backgroundColor={selectedThemes.includes(theme_name) ? '#4CAF50' : '#d3d3d3'}
            textColor={selectedThemes.includes(theme_name) ? '#fff' : '#000'}
            width={'100%'}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title="Commencer l'entraînement"
          onPress={startTraining}
          backgroundColor={isButtonDisabled ? '#ccc' : '#3099EF'}
          textColor={isButtonDisabled ? '#999' : '#fff'}
          width={'100%'}
          iconName="play-arrow"
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  header: { alignItems: 'center', width: '100%', paddingVertical: 20 },
  titleText: { color: '#000', fontSize: 20, textAlign: 'center' },
  descriptionText: { color: '#000', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flex: 1, alignItems: 'center', width: '100%', justifyContent: 'center', gap: 10 },
  footer: { width: '100%', paddingVertical: 20 },
});

export default TrainingScreen;
