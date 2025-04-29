import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Button, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

type HistoricScreenExamenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreenExamen'>;

const themes = ['Connaissance du milieu', 'Diplômes, compétences et obligations', 'Organisation administrative', 'Organisation de la sécurité', 'Surveillance et sécurité des activités spécifiques', 'Conduite à tenir en cas d’accident - Premiers secours'];

// --- Historique simulé ---
const fakeHistory = { [date: string]: number } = {
  '2025-04-28': 25,
  '2025-04-27': 30,
  '2025-04-26': 18,
  '2025-04-25': 35,
};

const HistoricScreenExamen: React.FC = () => {
    const [mode, setMode] = useState('examen');
    const [selectedTheme, setSelectedTheme] = useState<null | string>(null);
    const [examenScore, setExamenScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(40);
    const [data, setData] = useState<{
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[]>([]);

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const navigation = useNavigation<HistoricScreenExamenNavigationProp>();

    useEffect(() => {
        updateScoreForSelectedDate();
    }, [date]);

    const updateScoreForSelectedDate = () => {
        const formatted = formatDate(date);
        const score = fakeHistory[formatted] || 0;
        setExamenScore(score);
        updateChart(score);
    };

    const updateChart = (score: number) => {
        setData([
          { name: 'Bonnes réponses', population: score, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 9 },
          { name: 'Mauvaises réponses', population: totalQuestions - score, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 9 },
        ]);
    };

    const formatDate = (dateObj: Date) => {
        return dateObj.toISOString().split('T')[0];
    };

    const formattedDate = formatDate(date);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Historique de progression</Text>

                {/* Sélection de date */}
                <View style={styles.datePickerContainer}>
                    <Button title="Choisir une date" onPress={() => setShowPicker(true)} />
                    <Text style={styles.selectedDateText}>Date sélectionnée : {formattedDate}</Text>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowPicker(false);
                            if (selectedDate) {
                                setDate(selectedDate);
                            }
                        }}
                    />
                )}

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
                    <Text style={styles.resultsText}>Bonnes réponses : {mode === 'examen' ? examenScore : 0}</Text>
                    <Text style={styles.resultsText}>Mauvaises réponses : {totalQuestions - (mode === 'examen' ? examenScore : 0)}</Text>
                </View>
            </View>
        </ScrollView>
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
    scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 20 },
    container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    datePickerContainer: { marginBottom: 20, alignItems: 'center' },
    selectedDateText: { marginTop: 10, fontSize: 16, color: '#333' },
    themeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
    themeButton: { padding: 10, margin: 5, backgroundColor: '#ddd', borderRadius: 5 },
    selectedTheme: { backgroundColor: '#3099EF' },
    themeButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    chart: { marginVertical: 10, borderRadius: 10 },
    resultsContainer: { marginTop: 20 },
    resultsText: { fontSize: 18, color: '#333' },
});

export default HistoricScreenExamen;
