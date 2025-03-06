import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import questionsData from '../assets/data/questions.json';

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Theme {
  theme_name: string;
  questions: Question[];
}

export default function TrainingScreen() {
  const [themes] = useState<Theme[]>(questionsData.themes);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const animationHeight = useState(new Animated.Value(0))[0];

  const screenHeight = Dimensions.get('window').height;
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
    setSelectedThemes((prevSelected) =>
      prevSelected.includes(themeName)
        ? prevSelected.filter((name) => name !== themeName)
        : [...prevSelected, themeName]
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.dropdownTitle}>Sélectionner les thèmes</Text>

      <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
        <Text style={styles.dropdownText}>{isExpanded ? "Réduire" : "Déployer"}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownContainer, { height: animationHeight }]}>
        <View style={styles.themeBox}>
          {themes.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleSelection(item.theme_name)}
              style={[
                styles.itemContainer,
                selectedThemes.includes(item.theme_name) && styles.selectedItem,
              ]}
            >
              <Text style={styles.item}>{item.theme_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {selectedThemes.length > 0 && (
        <Text style={styles.selectedText}>
          Sélectionnés : {selectedThemes.join(', ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  dropdownTitle: {
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdownButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centre le texte horizontalement
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Centre le texte
  },
  dropdownContainer: {
    overflow: 'hidden',
    width: '100%',
    borderRadius: 5,
    marginTop: 10,
  },
  themeBox: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  item: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  selectedItem: {
    backgroundColor: 'lightblue',
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
