// HistoricScreen.tsx - Mise à jour pour récupérer les résultats depuis SQLite
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SQLite from 'react-native-sqlite-storage';
import Chart from '../components/Chart';
import ModeSelector from '../components/ModeSelector';
import Button from '../components/Button';

const db = SQLite.openDatabase({ name: 'bnssa.db', location: 'default' });

interface HistoryEntry {
  id: number;
  mode: string;
  score: number;
  total: number;
  date: string;
}

// Ajout des nouvelles propriétés : legendFontColor et legendFontSize
interface ChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function HistoricScreen() {
  const [mode, setMode] = useState('entrainement');
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchResults();
  }, [mode]);

  const fetchResults = async () => {
    try {
      const dbInstance = await db; // Résolution de la promesse
      dbInstance.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM history WHERE mode = ? ORDER BY date DESC LIMIT 10',
          [mode],
          (_, { rows }) => {
            const results: HistoryEntry[] = rows.raw(); // Type explicite pour `results`
            const correctAnswers = results.reduce((sum: number, entry: HistoryEntry) => sum + entry.score, 0);
            const totalQuestions = results.reduce((sum: number, entry: HistoryEntry) => sum + entry.total, 0);
            
            // Mise à jour des données avec les propriétés manquantes
            setData([
              { 
                name: 'Bonnes réponses', 
                population: correctAnswers, 
                color: 'green', 
                legendFontColor: '#000', // Couleur de la police du légende
                legendFontSize: 12 // Taille de la police du légende
              },
              { 
                name: 'Mauvaises réponses', 
                population: totalQuestions - correctAnswers, 
                color: 'red', 
                legendFontColor: '#000', // Couleur de la police du légende
                legendFontSize: 12 // Taille de la police du légende
              },
            ]);
          }
        );
      });
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique de progression</Text>
      <ModeSelector mode={mode} setMode={setMode} />
      <Chart data={data} mode={mode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
