import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width; // Récupère la largeur de l'écran

interface ChartProps {
  data: { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }[];
  mode: string;
}

const Chart: React.FC<ChartProps> = ({ data, mode }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>Répartition des réponses en {mode === 'examen' ? 'Examen' : 'Entraînement'}</Text>
      <PieChart
        data={data}
        width={screenWidth - 40} // Utilise toute la largeur disponible avec une marge
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        absolute
        style={styles.chart}
      />
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Assurer que le conteneur prend bien toute la largeur
    alignItems: 'center',
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 15,
    overflow: 'hidden', // Évite les débordements
  },
});

export default Chart;
