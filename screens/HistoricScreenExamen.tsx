import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  ImageBackground 
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { themes, themeColors, themeIcons } from '../components/themes';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type HistoricScreenExamenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreenExamen'>;

// ✅ Historique simulé avec signature correcte
const fakeHistory: Record<string, number> = {
  '2025-04-28': 25,
  '2025-04-27': 30,
  '2025-04-26': 18,
  '2025-04-25': 35,
};

const HistoricScreenExamen: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [examenScore, setExamenScore] = useState(0);
  const [totalQuestions] = useState(40);
  const [data, setData] = useState([
    { name: 'Bonnes réponses', population: 0, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Mauvaises réponses', population: 0, color: '#F44336', legendFontColor: '#333', legendFontSize: 12 },
  ]);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const navigation = useNavigation<HistoricScreenExamenNavigationProp>();

  // Effet pour charger les données quand la date change
  useEffect(() => {
    updateScoreForSelectedDate();
  }, [date, selectedTheme]);

  // Mise à jour du score pour la date sélectionnée
  const updateScoreForSelectedDate = () => {
    const formatted = formatDate(date);
    const score = fakeHistory[formatted] || 0;
    setExamenScore(score);
    updateChart(score);
  };

  // Mise à jour des données du graphique
  const updateChart = (score: number) => {
    setData([
      { name: 'Bonnes réponses', population: score, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Mauvaises réponses', population: totalQuestions - score, color: '#F44336', legendFontColor: '#333', legendFontSize: 12 },
    ]);
  };

  // Formatage de la date au format YYYY-MM-DD
  const formatDate = (dateObj: Date): string => {
    return dateObj.toISOString().split('T')[0];
  };

  // Format plus lisible pour la date
  const getFormattedDisplayDate = (dateObj: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return dateObj.toLocaleDateString('fr-FR', options);
  };

  const formattedDisplayDate = getFormattedDisplayDate(date);

  // Gestion du changement de date
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Gestion du changement de thème
  const toggleTheme = (theme: string) => {
    setSelectedTheme(selectedTheme === theme ? null : theme);
  };

  // Calcul du score en pourcentage
  const scorePercentage = Math.round((examenScore / totalQuestions) * 100);
  
  // Déterminer le statut en fonction du pourcentage
  let scoreStatus = '';
  let scoreStatusColor = '';
  
  if (scorePercentage >= 80) {
    scoreStatus = 'Excellent !';
    scoreStatusColor = '#4CAF50';
  } else if (scorePercentage >= 60) {
    scoreStatus = 'Bien';
    scoreStatusColor = '#8BC34A';
  } else if (scorePercentage >= 40) {
    scoreStatus = 'À améliorer';
    scoreStatusColor = '#FF9800';
  } else {
    scoreStatus = 'Insuffisant';
    scoreStatusColor = '#F44336';
  }

  // Personnaliser les options de navigation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#1e3c72',
        elevation: 0, // pour Android
        shadowOpacity: 0, // pour iOS
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      title: 'Historique d\'Examen',
    });
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3c72" />
      <LinearGradient
        colors={['#1e3c72', '#2a5298']}
        style={styles.pageGradient}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        accessible={true} 
        accessibilityLabel="Écran d'historique d'examen"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={22} color="#1e3c72" />
              <Text style={styles.cardHeaderText}>Sélection de date</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowPicker(true)}
              accessibilityLabel="Bouton pour choisir une date"
            >
              <Text style={styles.datePickerButtonText}>
                <Ionicons name="calendar-outline" size={16} /> {formattedDisplayDate}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                accessibilityLabel="Sélecteur de date"
                minimumDate={new Date(2024, 0, 1)}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="filter" size={22} color="#1e3c72" />
              <Text style={styles.cardHeaderText}>Filtres par thème</Text>
            </View>
            <View style={styles.themeContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeButton,
                    selectedTheme === theme && { backgroundColor: themeColors[theme as keyof typeof themeColors] }
                  ]}
                  onPress={() => toggleTheme(theme)}
                  accessibilityLabel={`Filtre par thème: ${theme}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedTheme === theme }}
                >
                  <Text style={styles.themeIcon}>{themeIcons[theme as keyof typeof themeIcons]}</Text>
                  <Text style={[
                    styles.themeButtonText,
                    selectedTheme === theme && styles.selectedThemeText
                  ]}>
                    {theme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pie-chart" size={22} color="#1e3c72" />
              <Text style={styles.cardHeaderText}>
                Répartition des réponses
                {selectedTheme ? ` - ${selectedTheme}` : ''}
              </Text>
            </View>
            
            <View style={styles.chartContainer}>
              <PieChart
                data={data}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
                center={[0, 0]}
                avoidFalseZero={true}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={22} color="#1e3c72" />
              <Text style={styles.cardHeaderText}>Résultats détaillés</Text>
            </View>

            <View style={styles.scoreCard}>
              <Text style={[styles.scoreStatus, {color: scoreStatusColor}]}>
                {scoreStatus}
              </Text>
              
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
              </View>
              
              <View style={styles.scoreDetails}>
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreDot, {backgroundColor: '#4CAF50'}]} />
                  <Text style={styles.scoreLabel}>Bonnes réponses:</Text>
                  <Text style={styles.scoreValue}>{examenScore}</Text>
                </View>
                
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreDot, {backgroundColor: '#F44336'}]} />
                  <Text style={styles.scoreLabel}>Mauvaises réponses:</Text>
                  <Text style={styles.scoreValue}>{totalQuestions - examenScore}</Text>
                </View>
                
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreDot, {backgroundColor: '#2196F3'}]} />
                  <Text style={styles.scoreLabel}>Total des questions:</Text>
                  <Text style={styles.scoreValue}>{totalQuestions}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Suggestions d'amélioration</Text>
              {scorePercentage < 60 && (
                <View style={styles.recommendationItem}>
                  <Ionicons name="alert-circle" size={20} color="#FF9800" />
                  <Text style={styles.recommendationText}>
                    Revoir vos connaissances sur les thèmes principaux
                  </Text>
                </View>
              )}
              
              <View style={styles.recommendationItem}>
                <Ionicons name="book" size={20} color="#4CAF50" />
                <Text style={styles.recommendationText}>
                  Continuer la pratique régulière des exercices
                </Text>
              </View>
              
              <View style={styles.recommendationItem}>
                <Ionicons name="time" size={20} color="#2196F3" />
                <Text style={styles.recommendationText}>
                  Essayez de compléter au moins 2 examens par semaine
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(30, 60, 114, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForLabels: {
    fontSize: 14,
  },
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  pageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 150,
    zIndex: -1,
  },
  scrollContainer: { 
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: { 
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#1e3c72',
  },
  datePickerButton: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  themeContainer: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeButton: { 
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  themeButtonText: { 
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selectedThemeText: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  scoreCard: {
    alignItems: 'center',
    marginVertical: 10,
  },
  scoreStatus: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3c72',
  },
  scoreDetails: {
    width: '100%',
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendations: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1e3c72',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
});

export default HistoricScreenExamen;