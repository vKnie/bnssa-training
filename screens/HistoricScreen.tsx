import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

const screenWidth = Dimensions.get('window').width;

type HistoricScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreen'>;

const themes = ['Connaissance du milieu', 'Diplômes, compétences et obligations', 'Organisation administrative', 'Organisation de la sécurité', 'Surveillance et sécurité des activités spécifiques', 'Conduite à tenir en cas d’accident - Premiers secours'];

const HistoricScreen: React.FC = () => {
  const [mode, setMode] = useState('examen'); // 'examen' ou 'entrainement'
  const [selectedTheme, setSelectedTheme] = useState<null | string>(null);
  const [examenScore, setExamenScore] = useState(0);
  const [entrainementScore, setEntrainementScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(40);
  const [data, setData] = useState<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[]>([]);

  const navigation = useNavigation<HistoricScreenNavigationProp>();
  // const { score1, score2 } = route.params || { score1: 30, score2: 20 };

  // useEffect(() => {
  //   setExamenScore(score1);
  //   setEntrainementScore(score2);
  // }, [score1, score2]);

  useEffect(() => {
    const selectedScore = mode === 'examen' ? examenScore : entrainementScore;
    setData([
      { name: 'Bonnes réponses', population: selectedScore, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 9 },
      { name: 'Mauvaises réponses', population: totalQuestions - selectedScore, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 9 },
    ]);
  }, [examenScore, entrainementScore, mode, totalQuestions]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Historique de progression</Text>
        
        {/* Bouton de filtre pour le mode */}
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
        
        {/* Boutons de filtre par thème */}
        <View style={styles.themeContainer}>
          {themes.map((theme) => (
            <TouchableOpacity 
              key={theme} 
              style={[styles.themeButton, selectedTheme === theme && styles.selectedTheme]} 
              onPress={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
            >
              <Text style={styles.themeButtonText}>{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.chartTitle}>Répartition des réponses en {mode === 'examen' ? 'Examen' : 'Entraînement'} ({selectedTheme})</Text>
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

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>Bonnes réponses : {mode === 'examen' ? examenScore : entrainementScore}</Text>
          <Text style={styles.resultsText}>Mauvaises réponses : {totalQuestions - (mode === 'examen' ? examenScore : entrainementScore)}</Text>
        </View>
      </View>
    </ScrollView>
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
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  modeButton: { padding: 10, marginHorizontal: 10, backgroundColor: '#ddd', borderRadius: 5 },
  selectedMode: { backgroundColor: '#3099EF' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  scrollContainer: {flexGrow: 1, alignItems: 'center', paddingBottom: 20},

  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  filterButton: { backgroundColor: '#3099EF', padding: 10, borderRadius: 5, marginBottom: 20 },
  filterButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  themeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  themeButton: { padding: 10, margin: 5, backgroundColor: '#ddd', borderRadius: 5 },
  selectedTheme: { backgroundColor: '#3099EF' },
  themeButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  chart: { marginVertical: 10, borderRadius: 10 },
  resultsContainer: { marginTop: 20 },
  resultsText: { fontSize: 18, color: '#333' },
});

export default HistoricScreen;
