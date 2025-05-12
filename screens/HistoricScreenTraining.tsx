import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { themes, themeColors, themeIcons } from '../components/themes';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type HistoricScreenTrainingNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreenTraining'>;

// ✅ Ajout d'historique simulé avec plus de détails
const fakeHistory: Record<string, Record<string, number>> = {
  'all': { score: 30, total: 40 },
  'Connaissance du milieu': { score: 15, total: 20 },
  'Diplômes, compétences et obligations': { score: 12, total: 15 },
  'Organisation administrative': { score: 8, total: 10 },
  'Organisation de la sécurité': { score: 18, total: 25 },
  'Surveillance et sécurité des activités spécifiques': { score: 10, total: 20 },
  'Conduite à tenir en cas d\'accident - Premiers secours': { score: 9, total: 15 },
};

const trainingHistory = [
  { id: 1, date: '2025-04-28', score: 25, total: 40, theme: 'Connaissance du milieu' },
  { id: 2, date: '2025-04-27', score: 30, total: 40, theme: 'Organisation de la sécurité' },
  { id: 3, date: '2025-04-26', score: 18, total: 30, theme: 'Diplômes, compétences et obligations' },
  { id: 4, date: '2025-04-25', score: 35, total: 40, theme: 'Connaissance du milieu' },
  { id: 5, date: '2025-04-24', score: 12, total: 20, theme: 'Organisation administrative' },
];

const HistoricScreenTraining: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [trainingScore, setTrainingScore] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(40);
  // Plus besoin des données pour le camembert
  const [goodAnswers, setGoodAnswers] = useState(30);
  const [badAnswers, setBadAnswers] = useState(10);
  
  // Filtre des entrées d'historique par thème sélectionné
  const filteredHistory = selectedTheme 
    ? trainingHistory.filter(item => item.theme === selectedTheme)
    : trainingHistory;

  const navigation = useNavigation<HistoricScreenTrainingNavigationProp>();
  
  // Effet pour mettre à jour les données quand le thème sélectionné change
  useEffect(() => {
    updateDataForTheme(selectedTheme);
  }, [selectedTheme]);

  // Mise à jour des données en fonction du thème sélectionné
  const updateDataForTheme = (theme: string | null) => {
    const themeKey = theme || 'all';
    const themeData = fakeHistory[themeKey];
    
    if (themeData) {
      const score = themeData.score;
      const total = themeData.total;
      
      setTrainingScore(score);
      setTotalQuestions(total);
      setGoodAnswers(score);
      setBadAnswers(total - score);
    }
  };

  // Gestion du changement de thème
  const toggleTheme = (theme: string) => {
    setSelectedTheme(selectedTheme === theme ? null : theme);
  };

  // Formatage de la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcul du score en pourcentage
  const scorePercentage = Math.round((trainingScore / totalQuestions) * 100);
  
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
        backgroundColor: '#FF5F6D',
        elevation: 0, // pour Android
        shadowOpacity: 0, // pour iOS
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      title: 'Historique d\'Entraînement',
    });
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5F6D" />
      <LinearGradient
        colors={['#FF5F6D', '#FFC371']}
        style={styles.pageGradient}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        accessible={true} 
        accessibilityLabel="Écran d'historique d'entraînement"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Card des filtres */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="filter" size={22} color="#FF5F6D" />
              <Text style={styles.cardHeaderText}>Filtres par thème</Text>
            </View>
            
            {/* Conteneur de scroll horizontal amélioré */}
            <View style={styles.themesScrollContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themesScrollContent}
                data={themes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.themeButton,
                      selectedTheme === item && { backgroundColor: themeColors[item as keyof typeof themeColors] }
                    ]}
                    onPress={() => toggleTheme(item)}
                    accessibilityLabel={`Filtre par thème: ${item}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedTheme === item }}
                  >
                    <Text style={styles.themeIcon}>{themeIcons[item as keyof typeof themeIcons]}</Text>
                    <Text style={[
                      styles.themeButtonText,
                      selectedTheme === item && styles.selectedThemeText
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            {selectedTheme && (
              <TouchableOpacity 
                style={styles.resetFilterButton}
                onPress={() => setSelectedTheme(null)}
              >
                <Ionicons name="close-circle" size={16} color="#666" />
                <Text style={styles.resetFilterText}>Réinitialiser le filtre</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Card Performance */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pie-chart" size={22} color="#FF5F6D" />
              <Text style={styles.cardHeaderText}>
                Performance Globale
                {selectedTheme ? ` - ${selectedTheme}` : ''}
              </Text>
            </View>
            
            <View style={styles.performanceRow}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
                <Text style={[styles.scoreStatus, {color: scoreStatusColor}]}>
                  {scoreStatus}
                </Text>
              </View>
              
              {/* Remplacer le camembert par une carte de progrès visuelle */}
              <View style={styles.progressCardContainer}>
                <View style={styles.progressBarVertical}>
                  <View style={[styles.progressBarFill, {height: `${scorePercentage}%`, backgroundColor: scoreStatusColor}]} />
                </View>
                <View style={styles.progressLevels}>
                  <Text style={[styles.progressLevelText, {color: scorePercentage >= 80 ? '#4CAF50' : '#ccc'}]}>80%</Text>
                  <Text style={[styles.progressLevelText, {color: scorePercentage >= 60 ? '#8BC34A' : '#ccc'}]}>60%</Text>
                  <Text style={[styles.progressLevelText, {color: scorePercentage >= 40 ? '#FF9800' : '#ccc'}]}>40%</Text>
                  <Text style={[styles.progressLevelText, {color: scorePercentage >= 20 ? '#F44336' : '#ccc'}]}>20%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.scoreDetails}>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreDot, {backgroundColor: '#4CAF50'}]} />
                <Text style={styles.scoreLabel}>Bonnes réponses</Text>
                <Text style={styles.scoreValue}>{trainingScore}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <View style={[styles.scoreDot, {backgroundColor: '#F44336'}]} />
                <Text style={styles.scoreLabel}>Mauvaises réponses</Text>
                <Text style={styles.scoreValue}>{totalQuestions - trainingScore}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <View style={[styles.scoreDot, {backgroundColor: '#2196F3'}]} />
                <Text style={styles.scoreLabel}>Total des questions</Text>
                <Text style={styles.scoreValue}>{totalQuestions}</Text>
              </View>
            </View>
          </View>

          {/* Card Historique */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={22} color="#FF5F6D" />
              <Text style={styles.cardHeaderText}>Historique des Sessions</Text>
            </View>

            {filteredHistory.length > 0 ? (
              <View style={styles.historyContainer}>
                {filteredHistory.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <LinearGradient
                      colors={['#f9f9f9', '#f0f0f0']}
                      style={styles.historyItemGradient}
                    >
                      <View style={styles.historyItemHeader}>
                        <Text style={styles.historyItemDate}>{formatDate(item.date)}</Text>
                        <Text style={[
                          styles.historyItemPercentage,
                          { color: item.score / item.total >= 0.6 ? '#4CAF50' : '#F44336' }
                        ]}>
                          {Math.round((item.score / item.total) * 100)}%
                        </Text>
                      </View>
                      
                      <View style={styles.historyItemDetails}>
                        <Text style={styles.historyItemTheme}>
                          {themeIcons[item.theme as keyof typeof themeIcons]} {item.theme}
                        </Text>
                        
                        <View style={styles.historyItemScores}>
                          <Text style={styles.historyItemScore}>
                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> {item.score}
                          </Text>
                          <Text style={styles.historyItemScore}>
                            <Ionicons name="close-circle" size={14} color="#F44336" /> {item.total - item.score}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar, 
                            { width: `${(item.score / item.total) * 100}%` }
                          ]} 
                        />
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#ccc" />
                <Text style={styles.noDataText}>Aucune donnée disponible</Text>
                <Text style={styles.noDataSubtext}>
                  Aucune session d'entraînement trouvée pour ce thème
                </Text>
              </View>
            )}
          </View>

          {/* Card Analyse */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-up" size={22} color="#FF5F6D" />
              <Text style={styles.cardHeaderText}>Analyse de Progression</Text>
            </View>
            
            <View style={styles.progressAnalysis}>
              <View style={styles.analysisItem}>
                <View style={styles.analysisIconContainer}>
                  <Ionicons name="star" size={24} color="#FFC107" />
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisTitle}>Points forts</Text>
                  <Text style={styles.analysisText}>
                    Connaissance du milieu, Organisation de la sécurité
                  </Text>
                </View>
              </View>
              
              <View style={styles.analysisItem}>
                <View style={styles.analysisIconContainer}>
                  <Ionicons name="flash" size={24} color="#FF9800" />
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisTitle}>À améliorer</Text>
                  <Text style={styles.analysisText}>
                    Organisation administrative, Diplômes et compétences
                  </Text>
                </View>
              </View>
              
              <View style={styles.analysisItem}>
                <View style={styles.analysisIconContainer}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisTitle}>Tendance</Text>
                  <Text style={styles.analysisText}>
                    Amélioration de 15% sur les 4 dernières sessions
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Commencer un nouvel entraînement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Plus besoin de la configuration du camembert

// Styles améliorés avec plus de cohérence et de responsivité
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
    height: 170,
    zIndex: -1,
  },
  scrollContainer: { 
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: { 
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    // Shadow uniforme pour tous les éléments
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#FF5F6D',
  },
  // Section des filtres améliorée
  themesScrollContainer: {
    marginVertical: 5,
    marginHorizontal: -4, // Compense le padding interne de la FlatList
  },
  themesScrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  themeButton: { 
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: screenWidth * 0.5, // Responsive width based on screen
    maxWidth: 220,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
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
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 8,
  },
  resetFilterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  // Section de performance améliorée sans camembert
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 2, // Marge pour éviter que le contenu touche les bords
  },
  scoreCircle: {
    width: screenWidth * 0.35, // Ajusté pour être plus grand maintenant que le camembert est retiré
    aspectRatio: 1, // Maintient un cercle parfait
    borderRadius: 999, // Grand nombre pour assurer un cercle parfait
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 5,
    borderColor: '#f0f0f0',
  },
  // Nouveaux styles pour la visualisation de progression
  progressCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
    flex: 1,
    paddingLeft: 20,
  },
  progressBarVertical: {
    width: 20,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end', // Pour faire croître la barre du bas vers le haut
  },
  progressBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  progressLevels: {
    height: 120,
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  progressLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scorePercentage: {
    fontSize: 32, // Augmenté car le cercle est plus grand maintenant
    fontWeight: 'bold',
    color: '#FF5F6D',
  },
  scoreStatus: {
    fontSize: 16, // Augmenté pour une meilleure lisibilité
    fontWeight: 'bold',
    marginTop: 5,
  },
  scoreDetails: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2, // Ajoute un peu d'espace vertical
  },
  scoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  scoreLabel: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  // Section historique améliorée
  historyContainer: {
    marginTop: 4,
  },
  historyItem: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyItemGradient: {
    padding: 15,
    borderRadius: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyItemDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  historyItemPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyItemTheme: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  historyItemScores: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Aligner à droite
    minWidth: 90, // Largeur minimale pour éviter les problèmes d'alignement
  },
  historyItemScore: {
    fontSize: 14,
    marginLeft: 10,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF5F6D',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 10,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  // Section analyse améliorée
  progressAnalysis: {
    marginBottom: 20,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  analysisIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#444',
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18, // Ajoute un peu d'espace pour la lisibilité
  },
  actionButton: {
    backgroundColor: '#FF5F6D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5F6D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HistoricScreenTraining;