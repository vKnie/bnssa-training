import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface FilterSectionProps {
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  themes: string[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ filterCategory, setFilterCategory, filter, setFilter, themes }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Filtrer par :</Text>
      <Picker selectedValue={filterCategory} onValueChange={(value) => setFilterCategory(value)} style={styles.picker}>
        <Picker.Item label="Sélectionner une catégorie" value="" />
        <Picker.Item label="Réponses" value="reponses" />
        <Picker.Item label="Thèmes" value="themes" />
      </Picker>
      {filterCategory === 'reponses' && (
        <Picker selectedValue={filter} onValueChange={(value) => setFilter(value)} style={styles.picker}>
          <Picker.Item label="Bonnes réponses" value="good" />
          <Picker.Item label="Mauvaises réponses" value="bad" />
        </Picker>
      )}
      {filterCategory === 'themes' && (
        <Picker selectedValue={filter} onValueChange={(value) => setFilter(value)} style={styles.picker}>
          {themes.map((theme, index) => (
            <Picker.Item key={index} label={theme} value={theme} />
          ))}
        </Picker>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { width: '100%', marginBottom: 10, padding: 10, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  picker: { height: 50, width: '100%' },
});

export default FilterSection;
