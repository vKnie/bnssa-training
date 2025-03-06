import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function HistoricScreen() {
  const [filterCategory, setFilterCategory] = useState('');
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState('examen');
  const [showFilters, setShowFilters] = useState(true); // État pour afficher/masquer les filtres

  // Liste des thèmes
  const themes = [
    'CONNAISSANCE DU MILIEU', 'DIPLOMES, COMPETENCES & OBLIGATIONS', 'ORGANISATION ADMINISTRATIVE',
    'ORGANISATION DE LA SECURITE', 'SURVEILLANCE ET SECURITE DES ACTIVITES SPECIFIQUES',
    'CONDUITE A TENIR EN CAS D’ACCIDENT - PREMIERS SOINS'
  ];

  // Données factices pour le diagramme circulaire
  const data = [
    { name: 'Bonnes réponses', population: 60, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Mauvaises réponses', population: 40, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique de progression</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.modeButton, mode === 'examen' && styles.selectedMode]} onPress={() => setMode('examen')}>
          <Text style={styles.buttonText}>Mode Examen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, mode === 'entrainement' && styles.selectedMode]} onPress={() => setMode('entrainement')}>
          <Text style={styles.buttonText}>Mode Entraînement</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton pour afficher/masquer les filtres */}
      <TouchableOpacity style={styles.toggleButton} onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.toggleButtonText}>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</Text>
      </TouchableOpacity>

      {/* Section des filtres */}
      {showFilters && (
        <View style={styles.section}>
          <Text style={styles.label}>Filtrer par :</Text>
          <Picker selectedValue={filterCategory} onValueChange={(value) => setFilterCategory(value)} style={styles.picker}>
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
      )}

      <Text style={styles.chartTitle}>Répartition des réponses en {mode === 'examen' ? 'Examen' : 'Entraînement'}</Text>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  modeButton: { padding: 10, marginHorizontal: 10, backgroundColor: '#ddd', borderRadius: 5 },
  selectedMode: { backgroundColor: '#4CAF50' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  section: { width: '100%', marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  picker: { height: 50, width: '100%' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  chart: { marginVertical: 10, borderRadius: 10 },
  toggleButton: { marginVertical: 10, padding: 10, backgroundColor: '#4CAF50', borderRadius: 5 },
  toggleButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' }
});