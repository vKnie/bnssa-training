import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

const screenWidth = Dimensions.get('window').width;

type HistoricScreenRouteProp = RouteProp<RootStackParamList, 'Historique'>;

export default function HistoricScreen() {
  const [filterCategory, setFilterCategory] = useState('');
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState('examen');
  const [showFilters, setShowFilters] = useState(true);
  const [data, setData] = useState([
    { name: 'Bonnes réponses', population: 0, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Mauvaises réponses', population: 0, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ]);

  const route = useRoute<HistoricScreenRouteProp>();
  const { score, totalQuestions } = route.params || { score: 0, totalQuestions: 1 };

  useEffect(() => {
    setData([
      { name: 'Bonnes réponses', population: score, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      { name: 'Mauvaises réponses', population: totalQuestions - score, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    ]);
  }, [score, totalQuestions]);

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

      <TouchableOpacity style={styles.toggleButton} onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.toggleButtonText}>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</Text>
      </TouchableOpacity>

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
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  chart: { marginVertical: 10, borderRadius: 10 },
  toggleButton: { marginVertical: 10, padding: 10, backgroundColor: '#4CAF50', borderRadius: 5 },
  toggleButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' }
});