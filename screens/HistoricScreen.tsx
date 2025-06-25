// screens/HistoricScreen.tsx
import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
} from '../components/themes';
import { RootStackParamList } from '../types';
import { databaseService, ExamSession, DetailedExamResult } from '../services/DatabaseService';
import TouchableButton from '../components/TouchableButton';

// Import des composants séparés
import {
  ProgressChart,
  ChartToggle,
  FilterDropdown,
  ExamSessionCard,
  GeneralStatsCard,
  SessionDetailsModal,
} from '../components/HistoricScreenComponents';

// Types
type HistoricScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreen'>;
type ChartViewType = 'global' | 'themes';

// === COMPOSANT PRINCIPAL ===
const HistoricScreen: React.FC = () => {
  const navigation = useNavigation<HistoricScreenNavigationProp>();
  const route = useRoute();
  const theme = getThemeForScreen(route.name);

  // États du composant
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ExamSession[]>([]);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DetailedExamResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showExamsList, setShowExamsList] = useState(false);
  const [chartViewType, setChartViewType] = useState<ChartViewType>('global');

  // Configuration du titre de l'écran
  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Historique des Examens',
      headerStyle: {
        backgroundColor: theme.primary,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, theme]);

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  // Fonction de chargement des données optimisée
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await databaseService.initDatabase();
      
      const [sessionsData, statsData] = await Promise.all([
        databaseService.getAllExamSessions(),
        databaseService.getGeneralStats()
      ]);
      
      setSessions(sessionsData);
      setFilteredSessions(sessionsData);
      setGeneralStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique des examens');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Affichage des détails d'une session
  const handleSessionPress = useCallback(async (session: ExamSession) => {
    try {
      if (!session.id) return;
      
      const sessionDetails = await databaseService.getExamSessionWithThemes(session.id);
      if (sessionDetails) {
        setSelectedSession(sessionDetails);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de cette session');
    }
  }, []);

  // Suppression d'une session
  const handleDeleteSession = useCallback((session: ExamSession) => {
    Alert.alert(
      'Supprimer la session',
      'Êtes-vous sûr de vouloir supprimer cette session d\'examen ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (session.id) {
                await databaseService.deleteExamSession(session.id);
                await loadData();
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer cette session');
            }
          }
        }
      ]
    );
  }, [loadData]);

  // État vide mémorisé
  const emptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Icon name="history" size={80} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Aucun examen trouvé
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textLight }]}>
        Vos résultats d'examens apparaîtront ici après avoir passé votre premier test
      </Text>
      <View style={styles.emptyButtonContainer}>
        <TouchableButton
          title="Passer un examen"
          onPress={() => navigation.navigate('ExamenScreen')}
          backgroundColor={theme.primary}
          textColor="#FFFFFF"
          width={220}
          height={50}
          iconName="assignment"
          iconSize={24}
        />
      </View>
    </View>
  ), [theme, navigation]);

  // État de chargement
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Icon name="hourglass-empty" size={60} color={theme.primary} />
          </View>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Chargement de l'historique...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.textLight }]}>
            Analyse de vos performances
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          sessions.length === 0 && styles.scrollContentEmpty
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.card}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          emptyState
        ) : (
          <>
            {/* Statistiques générales */}
            {generalStats && (
              <View style={styles.section}>
                <GeneralStatsCard stats={generalStats} theme={theme} />
              </View>
            )}

            {/* Section des graphiques avec toggle */}
            <View style={styles.section}>
              <ChartToggle
                viewType={chartViewType}
                onViewTypeChange={setChartViewType}
                theme={theme}
              />
              <ProgressChart
                sessions={sessions}
                viewType={chartViewType}
                theme={theme}
              />
            </View>

            {/* Section des filtres */}
            <View style={styles.section}>
              <FilterDropdown
                sessions={sessions}
                onFilterChange={setFilteredSessions}
                onToggleExamsList={setShowExamsList}
                theme={theme}
              />
            </View>

            {/* Section de la liste des examens */}
            {showExamsList ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="assignment" size={24} color={theme.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Examens ({filteredSessions.length})
                  </Text>
                </View>
                
                <View style={styles.sessionsList}>
                  {filteredSessions.map((session) => (
                    <ExamSessionCard
                      key={session.id}
                      session={session}
                      onPress={() => handleSessionPress(session)}
                      onDelete={() => handleDeleteSession(session)}
                      theme={theme}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.hiddenExamsContainer}>
                <View style={[styles.hiddenExamsIconContainer, { backgroundColor: theme.textLight + '20' }]}>
                  <Icon name="visibility-off" size={48} color={theme.textLight} />
                </View>
                <Text style={[styles.hiddenExamsTitle, { color: theme.text }]}>
                  Liste des examens masquée
                </Text>
                <Text style={[styles.hiddenExamsSubtitle, { color: theme.textLight }]}>
                  Utilisez le bouton "Afficher les examens" pour consulter votre historique détaillé
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de détails */}
      <SessionDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        sessionDetails={selectedSession}
        theme={theme}
      />
    </SafeAreaView>
  );
};

// === STYLES ===
const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  scrollContentEmpty: {
    justifyContent: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  sectionTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.s,
  },
  sessionsList: {
    gap: spacing.s,
  },

  // État de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  loadingText: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  loadingSubtext: {
    fontSize: typography.body1,
    textAlign: 'center',
  },

  // État vide
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.heading1,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  emptySubtitle: {
    fontSize: typography.body1,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: '85%',
  },
  emptyButtonContainer: {
    marginTop: spacing.l,
  },

  // État masqué
  hiddenExamsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.xl,
  },
  hiddenExamsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  hiddenExamsTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  hiddenExamsSubtitle: {
    fontSize: typography.body2,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
});

export default HistoricScreen;