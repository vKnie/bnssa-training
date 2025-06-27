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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { 
  getThemeForScreen, 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
} from '../components/themes';
import { RootStackParamList } from '../types';
import { databaseService, ExamSession } from '../services/DatabaseService';
import TouchableButton from '../components/TouchableButton';
import { StatsOverviewCard } from '../components/HistoricComponents';

type HistoricScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreen'>;

const HistoricScreen: React.FC = () => {
  const navigation = useNavigation<HistoricScreenNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const theme = getThemeForScreen(route.name);

  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: 'Historique des Examens',
      headerStyle: { backgroundColor: theme.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation, theme]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await databaseService.initDatabase();
      
      const [sessionsData, statsData] = await Promise.all([
        databaseService.getAllExamSessions(),
        databaseService.getGeneralStats()
      ]);
      
      setSessions(sessionsData);
      setGeneralStats(statsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const emptyState = useMemo(() => (
    <View style={[
      styles.emptyContainer,
      { 
        paddingTop: Math.max(insets.top, spacing.xl),
        paddingBottom: Math.max(insets.bottom, spacing.xl),
        minHeight: '80%'
      }
    ]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Icon name="history" size={80} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Aucun examen trouvé
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textLight }]}>
        Commencez par passer votre premier examen pour voir vos statistiques
      </Text>
      <View style={styles.emptyButtonContainer}>
        <TouchableButton
          title="Passer un examen"
          onPress={() => navigation.navigate('ExamenScreen')}
          backgroundColor={theme.primary}
          textColor="#FFFFFF"
          width={200}
          iconName="assignment"
        />
      </View>
    </View>
  ), [theme, navigation, insets]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[
          styles.loadingContainer,
          {
            paddingTop: Math.max(insets.top, spacing.xl),
            paddingBottom: Math.max(insets.bottom, spacing.xl)
          }
        ]}>
          <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Icon name="analytics" size={60} color={theme.primary} />
          </View>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Analyse en cours...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.textLight }]}>
            Traitement de vos données d'examen
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: spacing.s,
            paddingBottom: Math.max(insets.bottom + spacing.m, spacing.xl),
            paddingHorizontal: spacing.xs,
          }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          emptyState
        ) : (
          <View style={styles.contentContainer}>
            <StatsOverviewCard 
              stats={generalStats} 
              sessions={sessions} 
              theme={theme}
              insets={insets}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
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
    maxWidth: '90%',
  },
  emptyButtonContainer: {
    marginTop: spacing.l,
  },
});

export default HistoricScreen;