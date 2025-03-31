import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

const screenWidth = Dimensions.get('window').width;

type HistoricScreenRouteProp = RouteProp<RootStackParamList, 'Historique'>;

export default function HistoricScreen() {
  const [mode, setMode] = useState('examen'); // 'examen' ou 'entrainement'
  const [examenScore, setExamenScore] = useState(0);  // Score spécifique pour le mode Examen
  const [entrainementScore, setEntrainementScore] = useState(0);  // Score spécifique pour le mode Entraînement
  const [totalQuestions, setTotalQuestions] = useState(40); // Total des questions dans l'examen ou l'entraînement
  const [data, setData] = useState([
    { name: 'Bonnes réponses', population: 0, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 10 },
    { name: 'Mauvaises réponses', population: 0, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 10 },
  ]);

  const route = useRoute<HistoricScreenRouteProp>();
  const { score } = route.params || { score: 35 };  // On récupère le score passé en paramètre de navigation

  useEffect(() => {
    if (mode === 'examen') {
      // Mise à jour des données pour le mode Examen
      setExamenScore(score);
    } else if (mode === 'entrainement') {
      // Mise à jour des données pour le mode Entraînement
      setEntrainementScore(score);
    }
  }, [score, mode]);

  useEffect(() => {
    // Mettre à jour le graphique en fonction du mode actuel
    if (mode === 'examen') {
      setData([
        { name: 'Bonnes réponses', population: examenScore, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 10 },
        { name: 'Mauvaises réponses', population: totalQuestions - examenScore, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 10 },
      ]);
    } else if (mode === 'entrainement') {
      setData([
        { name: 'Bonnes réponses', population: entrainementScore, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 10 },
        { name: 'Mauvaises réponses', population: totalQuestions - entrainementScore, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 10 },
      ]);
    }
  }, [examenScore, entrainementScore, mode, totalQuestions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique de progression</Text>

      {/* Buttons to switch between modes */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'examen' && styles.selectedMode]}
          onPress={() => setMode('examen')}
        >
          <Text style={styles.buttonText}>Mode Examen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'entrainement' && styles.selectedMode]}
          onPress={() => setMode('entrainement')}
        >
          <Text style={styles.buttonText}>Mode Entraînement</Text>
        </TouchableOpacity>
      </View>

      {/* Chart display */}
      <Text style={styles.chartTitle}>
        Répartition des réponses en {mode === 'examen' ? 'Examen' : 'Entraînement'}
      </Text>
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

      {/* Displaying results under the chart */}
      {/* <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Bonnes réponses : {mode === 'examen' ? examenScore : entrainementScore}
        </Text>
        <Text style={styles.resultsText}>
          Mauvaises réponses : {mode === 'examen' ? totalQuestions - examenScore : totalQuestions - entrainementScore}
        </Text>
      </View> */}
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
  selectedMode: { backgroundColor: '#3099EF' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  chart: { marginVertical: 10, borderRadius: 10 },
  resultsContainer: { marginTop: 20 },
  resultsText: { fontSize: 18, color: '#333' },
});
