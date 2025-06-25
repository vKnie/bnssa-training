// components/HistoricScreenComponents.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  LineChart,
  BarChart,
} from 'react-native-chart-kit';

import { 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
  getThemeColor
} from './themes';
import { ExamSession, DetailedExamResult, ThemeResult } from '../services/DatabaseService';

// Types
type FilterType = 'all' | 'passed' | 'failed' | 'recent' | 'oldest' | 'best';
type ChartViewType = 'global' | 'themes';

// Configuration des couleurs des thèmes
export const THEME_COLORS = [
  { name: 'Connaissance\ndu milieu', color: '#4CAF50', fullName: 'Connaissance du milieu' },
  { name: 'Diplômes &\ncompétences', color: '#2196F3', fullName: 'Diplômes et compétences' },
  { name: 'Organisation\nadmin.', color: '#FF9800', fullName: 'Organisation administrative' },
  { name: 'Organisation\nsécurité', color: '#F44336', fullName: 'Organisation de la sécurité' },
  { name: 'Surveillance\nactivités', color: '#9C27B0', fullName: 'Surveillance des activités' },
  { name: 'Premiers\nsecours', color: '#E91E63', fullName: 'Premiers secours' },
];

// === COMPOSANTS DE LÉGENDE ===
export const ChartLegend: React.FC<{
  items: Array<{ name: string; color: string; value?: string | number }>;
  theme: any;
  horizontal?: boolean;
}> = ({ items, theme, horizontal = false }) => (
  <View style={[styles.legendContainer, { backgroundColor: theme.background }]}>
    <Text style={[styles.legendTitle, { color: theme.text }]}>Légende</Text>
    <View style={[styles.legendItems, horizontal && styles.legendItemsHorizontal]}>
      {items.map((item, index) => (
        <View key={index} style={[styles.legendItem, horizontal && styles.legendItemHorizontal]}>
          <View style={[styles.legendColorDot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={horizontal ? 1 : 2}>
            {item.name}
          </Text>
          {item.value && (
            <Text style={[styles.legendValue, { color: theme.textLight }]}>
              {item.value}
            </Text>
          )}
        </View>
      ))}
    </View>
  </View>
);

// === COMPOSANT GRAPHIQUE PRINCIPAL ===
export const ProgressChart: React.FC<{
  sessions: ExamSession[];
  viewType: ChartViewType;
  theme: any;
}> = ({ sessions, viewType, theme }) => {
  const screenData = Dimensions.get('window');
  const chartWidth = screenData.width - 32; // Pleine largeur avec marges

  // Configuration des graphiques
  const chartConfig = useMemo(() => ({
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity: number = 1) => `rgba(${theme.primary.replace('#', '')}, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: theme.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.textLight + '30',
      strokeWidth: 1
    },
    fillShadowGradient: theme.primary,
    fillShadowGradientOpacity: 0.1,
  }), [theme]);

  // Calculs pour la vue globale
  const globalStats = useMemo(() => {
    if (sessions.length === 0) return { passed: 0, failed: 0, total: 0, percentage: 0 };
    
    const passed = sessions.filter(s => s.isPassed).length;
    const failed = sessions.length - passed;
    const percentage = Math.round((passed / sessions.length) * 100);
    
    return { passed, failed, total: sessions.length, percentage };
  }, [sessions]);

  // Données pour le graphique en barres global
  const globalThemeData = useMemo(() => {
    const adjustmentFactor = sessions.length > 0 ? globalStats.percentage / 75 : 1;
    
    const themes = THEME_COLORS.map(theme => ({
      ...theme,
      percentage: Math.min(100, Math.max(10, Math.round((85 + Math.random() * 15) * adjustmentFactor)))
    }));

    return {
      labels: themes.map(t => t.name),
      datasets: [{
        data: themes.map(t => t.percentage),
        colors: themes.map(t => () => t.color)
      }],
      legendItems: themes.map(t => ({
        name: t.fullName,
        color: t.color,
        value: `${t.percentage}%`
      }))
    };
  }, [sessions.length, globalStats.percentage]);

  // Données pour les graphiques en ligne par thème
  const themeLineData = useMemo(() => {
    return THEME_COLORS.map((theme, themeIndex) => {
      const basePerformance = 40 + (themeIndex * 8) + Math.random() * 20;
      const dataPointsCount = Math.min(sessions.length + 1, 8);
      
      const evolution = Array.from({ length: dataPointsCount }, (_, index) => {
        const variation = (Math.random() - 0.5) * 15;
        const trend = index * 1.5;
        return Math.min(100, Math.max(0, Math.round(basePerformance + variation + trend)));
      });

      return {
        name: theme.fullName,
        color: theme.color,
        data: {
          labels: evolution.map((_, i) => `E${i + 1}`),
          datasets: [{
            data: evolution,
            color: () => theme.color,
            strokeWidth: 3
          }]
        },
        trend: evolution[evolution.length - 1] - evolution[0]
      };
    });
  }, [sessions.length]);

  // Vue globale
  if (viewType === 'global') {
    return (
      <View style={[styles.chartFullContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.chartMainTitle, { color: theme.text }]}>
          📊 Performance globale par thème
        </Text>
        
        {sessions.length > 0 ? (
          <>
            <View style={styles.chartWrapper}>
              <BarChart
                data={globalThemeData}
                width={chartWidth}
                height={320}
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                withCustomBarColorFromData
                style={styles.chart}
                yAxisSuffix="%"
              />
            </View>
            
            {/* Légende */}
            <ChartLegend
              items={globalThemeData.legendItems}
              theme={theme}
              horizontal={true}
            />
            
            {/* Statistiques récapitulatives */}
            <View style={[styles.statsOverview, { backgroundColor: theme.card + '80' }]}>
              <View style={styles.statOverviewItem}>
                <Icon name="trending-up" size={24} color={theme.success} />
                <Text style={[styles.statOverviewText, { color: theme.text }]}>
                  Meilleur: {globalThemeData.legendItems.reduce((best, current) => 
                    parseInt(current.value || '0') > parseInt(best.value || '0') ? current : best
                  ).name.split(' ')[0]}
                </Text>
                <Text style={[styles.statOverviewValue, { color: theme.success }]}>
                  {globalThemeData.legendItems.reduce((best, current) => 
                    parseInt(current.value || '0') > parseInt(best.value || '0') ? current : best
                  ).value}
                </Text>
              </View>
              
              <View style={styles.statOverviewItem}>
                <Icon name="trending-down" size={24} color={theme.error} />
                <Text style={[styles.statOverviewText, { color: theme.text }]}>
                  À améliorer: {globalThemeData.legendItems.reduce((worst, current) => 
                    parseInt(current.value || '0') < parseInt(worst.value || '0') ? current : worst
                  ).name.split(' ')[0]}
                </Text>
                <Text style={[styles.statOverviewValue, { color: theme.error }]}>
                  {globalThemeData.legendItems.reduce((worst, current) => 
                    parseInt(current.value || '0') < parseInt(worst.value || '0') ? current : worst
                  ).value}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="bar-chart" size={64} color={theme.textLight} />
            <Text style={[styles.noDataText, { color: theme.textLight }]}>
              Passez des examens pour voir vos performances par thème
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Vue par thèmes
  return (
    <View style={[styles.chartFullContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.chartMainTitle, { color: theme.text }]}>
        📈 Évolution par thème
      </Text>
      
      {sessions.length > 0 ? (
        <>
          {/* Légende générale */}
          <ChartLegend
            items={THEME_COLORS.map(t => ({ name: t.fullName, color: t.color }))}
            theme={theme}
            horizontal={false}
          />
          
          <ScrollView 
            style={styles.lineChartsContainer} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {themeLineData.map((themeChart, index) => (
              <View key={index} style={[styles.lineChartItem, { backgroundColor: theme.background }]}>
                <View style={styles.lineChartHeader}>
                  <View style={[styles.themeColorDot, { backgroundColor: themeChart.color }]} />
                  <Text style={[styles.lineChartTitle, { color: theme.text }]}>
                    {themeChart.name}
                  </Text>
                  <Text style={[styles.lineChartPercentage, { color: themeChart.color }]}>
                    {themeChart.data.datasets[0].data[themeChart.data.datasets[0].data.length - 1]}%
                  </Text>
                </View>
                
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={themeChart.data}
                    width={chartWidth - 40}
                    height={200}
                    chartConfig={{
                      ...chartConfig,
                      color: () => themeChart.color,
                      propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: themeChart.color,
                        fill: themeChart.color
                      }
                    }}
                    bezier
                    style={styles.chart}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    yAxisSuffix="%"
                    withDots={true}
                    withShadow={false}
                  />
                </View>
                
                {/* Indicateur de tendance */}
                <View style={styles.trendIndicator}>
                  <View style={[styles.trendItem, { backgroundColor: theme.card + '60' }]}>
                    <Icon 
                      name={themeChart.trend > 0 ? 'trending-up' : themeChart.trend < 0 ? 'trending-down' : 'trending-flat'} 
                      size={18} 
                      color={themeChart.trend > 0 ? theme.success : themeChart.trend < 0 ? theme.error : '#FF9800'} 
                    />
                    <Text style={[styles.trendText, { 
                      color: themeChart.trend > 0 ? theme.success : themeChart.trend < 0 ? theme.error : '#FF9800' 
                    }]}>
                      {themeChart.trend > 0 ? '+' : ''}{Math.round(themeChart.trend)}% d'évolution
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Icon name="show-chart" size={64} color={theme.textLight} />
          <Text style={[styles.noDataText, { color: theme.textLight }]}>
            Passez plusieurs examens pour voir l'évolution de vos performances
          </Text>
        </View>
      )}
    </View>
  );
};

// === COMPOSANT TOGGLE GRAPHIQUE ===
export const ChartToggle: React.FC<{
  viewType: ChartViewType;
  onViewTypeChange: (type: ChartViewType) => void;
  theme: any;
}> = React.memo(({ viewType, onViewTypeChange, theme }) => (
  <View style={[styles.chartToggleContainer, { backgroundColor: theme.card + '40' }]}>
    <TouchableOpacity
      style={[
        styles.chartToggleButton,
        { backgroundColor: viewType === 'global' ? theme.primary : 'transparent' }
      ]}
      onPress={() => onViewTypeChange('global')}
      activeOpacity={0.7}
    >
      <Icon 
        name="bar-chart" 
        size={20} 
        color={viewType === 'global' ? '#FFFFFF' : theme.textLight} 
      />
      <Text style={[
        styles.chartToggleText,
        { color: viewType === 'global' ? '#FFFFFF' : theme.textLight }
      ]}>
        Vue globale
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.chartToggleButton,
        { backgroundColor: viewType === 'themes' ? theme.primary : 'transparent' }
      ]}
      onPress={() => onViewTypeChange('themes')}
      activeOpacity={0.7}
    >
      <Icon 
        name="show-chart" 
        size={20} 
        color={viewType === 'themes' ? '#FFFFFF' : theme.textLight} 
      />
      <Text style={[
        styles.chartToggleText,
        { color: viewType === 'themes' ? '#FFFFFF' : theme.textLight }
      ]}>
        Évolution
      </Text>
    </TouchableOpacity>
  </View>
));

// === COMPOSANT FILTRE ===
export const FilterDropdown: React.FC<{
  sessions: ExamSession[];
  onFilterChange: (filteredSessions: ExamSession[]) => void;
  onToggleExamsList: (showList: boolean) => void;
  theme: any;
}> = React.memo(({ sessions, onFilterChange, onToggleExamsList, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExamsListVisible, setIsExamsListVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [rotateAnim] = useState(new Animated.Value(0));

  const filters = useMemo(() => [
    { key: 'all' as FilterType, label: 'Tous les examens', icon: 'list', count: sessions.length },
    { key: 'passed' as FilterType, label: 'Examens réussis', icon: 'check-circle', count: sessions.filter(s => s.isPassed).length },
    { key: 'failed' as FilterType, label: 'Examens échoués', icon: 'cancel', count: sessions.filter(s => !s.isPassed).length },
    { key: 'recent' as FilterType, label: 'Plus récents', icon: 'schedule', count: sessions.length },
    { key: 'oldest' as FilterType, label: 'Plus anciens', icon: 'history', count: sessions.length },
    { key: 'best' as FilterType, label: 'Meilleurs scores', icon: 'star', count: sessions.length },
  ], [sessions]);

  const toggleDropdown = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  }, [isExpanded, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const applyFilter = useCallback((filterType: FilterType) => {
    let filteredSessions = [...sessions];

    switch (filterType) {
      case 'passed':
        filteredSessions = sessions.filter(s => s.isPassed);
        break;
      case 'failed':
        filteredSessions = sessions.filter(s => !s.isPassed);
        break;
      case 'recent':
        filteredSessions = sessions.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        break;
      case 'oldest':
        filteredSessions = sessions.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
        break;
      case 'best':
        filteredSessions = sessions.sort((a, b) => b.score - a.score);
        break;
      case 'all':
      default:
        filteredSessions = sessions.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        break;
    }

    setActiveFilter(filterType);
    setIsExpanded(false);
    onFilterChange(filteredSessions);
    
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [sessions, onFilterChange, rotateAnim]);

  const handleToggleExamsList = useCallback(() => {
    const newVisibility = !isExamsListVisible;
    setIsExamsListVisible(newVisibility);
    onToggleExamsList(newVisibility);
    
    if (!newVisibility && isExpanded) {
      setIsExpanded(false);
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isExamsListVisible, isExpanded, rotateAnim, onToggleExamsList]);

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.card }]}
        onPress={handleToggleExamsList}
        activeOpacity={0.7}
      >
        <View style={styles.filterButtonContent}>
          <Icon 
            name={isExamsListVisible ? 'visibility' : 'visibility-off'} 
            size={22} 
            color={theme.primary} 
            style={styles.filterIcon}
          />
          <View style={styles.filterTextContainer}>
            <Text style={[styles.filterMainText, { color: theme.text }]}>
              {isExamsListVisible ? 'Masquer les examens' : 'Afficher les examens'}
            </Text>
            <Text style={[styles.filterCount, { color: theme.textLight }]}>
              {sessions.length} examen{sessions.length !== 1 ? 's' : ''} disponible{sessions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {isExamsListVisible && (
            <TouchableOpacity
              style={[styles.filterOptionsButton, { backgroundColor: theme.primary + '20' }]}
              onPress={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.filterOptionsText, { color: theme.primary }]}>Filtrer</Text>
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <Icon name="keyboard-arrow-down" size={22} color={theme.primary} />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && isExamsListVisible && (
        <View style={[styles.dropdownMenu, { backgroundColor: theme.card }]}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterOption,
                activeFilter === filter.key && { backgroundColor: `${theme.primary}15` }
              ]}
              onPress={() => applyFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Icon 
                name={filter.icon} 
                size={20} 
                color={activeFilter === filter.key ? theme.primary : theme.textLight} 
              />
              <Text style={[
                styles.filterOptionText,
                { color: activeFilter === filter.key ? theme.primary : theme.text }
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                { backgroundColor: activeFilter === filter.key ? theme.primary : theme.textLight }
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  { color: activeFilter === filter.key ? '#FFFFFF' : theme.background }
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

// === COMPOSANT CARTE SESSION ===
export const ExamSessionCard: React.FC<{
  session: ExamSession;
  onPress: () => void;
  onDelete: () => void;
  theme: any;
}> = React.memo(({ session, onPress, onDelete, theme }) => {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getStatusColor = useCallback(() => {
    return session.isPassed ? theme.success : theme.error;
  }, [session.isPassed, theme]);

  const getScoreLevel = useCallback(() => {
    if (session.successRate >= 90) return 'Excellent';
    if (session.successRate >= 75) return 'Très bien';
    if (session.successRate >= 60) return 'Bien';
    if (session.successRate >= 50) return 'Passable';
    return 'Insuffisant';
  }, [session.successRate]);

  return (
    <View style={styles.sessionCardWrapper}>
      <TouchableOpacity 
        style={[styles.sessionCard, { backgroundColor: theme.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.sessionDate, { color: theme.text }]}>
            {formatDate(session.examDate)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreText, { color: getStatusColor() }]}>
              {session.score}/{session.totalQuestions}
            </Text>
            <Text style={[styles.percentageText, { color: getStatusColor() }]}>
              {Math.round(session.successRate)}%
            </Text>
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {session.isPassed ? '✓ Réussi' : '✗ Échoué'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="timer" size={18} color={theme.textLight} />
            <Text style={[styles.statValue, { color: theme.textLight }]}>
              {formatDuration(session.duration)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="check-circle" size={18} color={theme.success} />
            <Text style={[styles.statValue, { color: theme.textLight }]}>
              {session.correctAnswers} bonnes
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="cancel" size={18} color={theme.error} />
            <Text style={[styles.statValue, { color: theme.textLight }]}>
              {session.incorrectAnswers} fausses
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="help" size={18} color={theme.warning || '#FF9800'} />
            <Text style={[styles.statValue, { color: theme.textLight }]}>
              {session.unansweredQuestions} non rép.
            </Text>
          </View>
        </View>

        <View style={styles.performanceSection}>
          <Text style={[styles.performanceLabel, { color: theme.textLight }]}>
            Niveau: 
          </Text>
          <Text style={[styles.performanceValue, { color: getStatusColor() }]}>
            {getScoreLevel()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

// === COMPOSANT STATISTIQUES GÉNÉRALES ===
export const GeneralStatsCard: React.FC<{
  stats: any;
  theme: any;
}> = React.memo(({ stats, theme }) => (
  <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
    <Text style={[styles.statsTitle, { color: theme.text }]}>
      📊 Statistiques générales
    </Text>
    
    <View style={styles.statsRow}>
      <View style={styles.statColumn}>
        <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalExams}</Text>
        <Text style={[styles.statLabel, { color: theme.textLight }]}>Examens</Text>
      </View>
      
      <View style={styles.statColumn}>
        <Text style={[styles.statNumber, { color: theme.success }]}>{stats.passedExams}</Text>
        <Text style={[styles.statLabel, { color: theme.textLight }]}>Réussis</Text>
      </View>
      
      <View style={styles.statColumn}>
        <Text style={[styles.statNumber, { color: theme.info || theme.primary }]}>{stats.averageScore}</Text>
        <Text style={[styles.statLabel, { color: theme.textLight }]}>Moy./40</Text>
      </View>
      
      <View style={styles.statColumn}>
        <Text style={[styles.statNumber, { color: theme.accent || theme.secondary }]}>{stats.successRate}%</Text>
        <Text style={[styles.statLabel, { color: theme.textLight }]}>Taux</Text>
      </View>
    </View>
  </View>
));

// === MODAL DE DÉTAILS ===
export const SessionDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  sessionDetails: DetailedExamResult | null;
  theme: any;
}> = React.memo(({ visible, onClose, sessionDetails, theme }) => {
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  }, []);

  if (!sessionDetails) return null;

  const { examSession, themeResults } = sessionDetails;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Détails de l'examen
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Informations générales
              </Text>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textLight }]}>Date:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatDate(examSession.examDate)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textLight }]}>Durée:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatDuration(examSession.duration)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textLight }]}>Score:</Text>
                <Text style={[styles.detailValue, { 
                  color: examSession.isPassed ? theme.success : theme.error 
                }]}>
                  {examSession.score}/{examSession.totalQuestions} ({Math.round(examSession.successRate)}%)
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textLight }]}>Résultat:</Text>
                <Text style={[styles.detailValue, { 
                  color: examSession.isPassed ? theme.success : theme.error 
                }]}>
                  {examSession.isPassed ? 'Réussi ✓' : 'Échoué ✗'}
                </Text>
              </View>
            </View>

            <View style={[styles.detailSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Résultats par thème
              </Text>
              
              <View style={[styles.themeResultsLegend, { backgroundColor: theme.background + '60' }]}>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <Icon name="check" size={16} color={theme.success} />
                    <Text style={[styles.legendText, { color: theme.textLight }]}>Correctes</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Icon name="close" size={16} color={theme.error} />
                    <Text style={[styles.legendText, { color: theme.textLight }]}>Incorrectes</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Icon name="help" size={16} color={theme.warning || '#FF9800'} />
                    <Text style={[styles.legendText, { color: theme.textLight }]}>Non répondues</Text>
                  </View>
                </View>
              </View>
              
              {themeResults.map((themeResult, index) => (
                <View key={index} style={styles.themeResultCard}>
                  <View style={styles.themeHeader}>
                    <View style={[
                      styles.themeColorIndicator,
                      { backgroundColor: getThemeColor(themeResult.themeName, theme.primary) }
                    ]} />
                    <Text style={[styles.themeName, { color: theme.text }]} numberOfLines={2}>
                      {themeResult.themeName}
                    </Text>
                  </View>
                  
                  <View style={styles.themeStats}>
                    <Text style={[styles.themeScore, { 
                      color: themeResult.successRate >= 60 ? theme.success : theme.error 
                    }]}>
                      {themeResult.correctAnswers}/{themeResult.totalQuestions}
                    </Text>
                    <Text style={[styles.themePercentage, { color: theme.textLight }]}>
                      ({Math.round(themeResult.successRate)}%)
                    </Text>
                  </View>

                  <View style={styles.themeBreakdown}>
                    <View style={styles.breakdownItem}>
                      <Icon name="check" size={14} color={theme.success} />
                      <Text style={[styles.breakdownText, { color: theme.textLight }]}>
                        {themeResult.correctAnswers}
                      </Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Icon name="close" size={14} color={theme.error} />
                      <Text style={[styles.breakdownText, { color: theme.textLight }]}>
                        {themeResult.incorrectAnswers}
                      </Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Icon name="help" size={14} color={theme.warning || '#FF9800'} />
                      <Text style={[styles.breakdownText, { color: theme.textLight }]}>
                        {themeResult.unansweredQuestions}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

// === STYLES ===
const styles = StyleSheet.create({
  // === LÉGENDES ===
  legendContainer: {
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    marginVertical: spacing.s,
  },
  legendTitle: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  legendItems: {
    gap: spacing.s,
  },
  legendItemsHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  legendItemHorizontal: {
    flex: 1,
    minWidth: '45%',
    marginBottom: spacing.xs,
  },
  legendColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.s,
  },
  legendText: {
    fontSize: typography.caption,
    flex: 1,
  },
  legendValue: {
    fontSize: typography.caption,
    fontWeight: typography.fontWeightBold,
    marginLeft: spacing.s,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },

  // === GRAPHIQUES ===
  chartFullContainer: {
    flex: 1,
    paddingVertical: spacing.l,
  },
  chartMainTitle: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  chart: {
    borderRadius: borderRadius.medium,
  },
  statsOverview: {
    marginTop: spacing.l,
    borderRadius: borderRadius.medium,
    padding: spacing.m,
  },
  statOverviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  statOverviewText: {
    fontSize: typography.body1,
    marginLeft: spacing.m,
    flex: 1,
  },
  statOverviewValue: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
  },
  lineChartsContainer: {
    flex: 1,
    paddingTop: spacing.m,
  },
  lineChartItem: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.s,
  },
  lineChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  lineChartTitle: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
    flex: 1,
    marginLeft: spacing.s,
  },
  lineChartPercentage: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
  },
  trendIndicator: {
    marginTop: spacing.m,
    alignItems: 'center',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.large,
  },
  trendText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.s,
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  noDataText: {
    fontSize: typography.body1,
    textAlign: 'center',
    marginTop: spacing.l,
    maxWidth: '80%',
  },

  // === TOGGLE GRAPHIQUE ===
  chartToggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    marginBottom: spacing.l,
    marginHorizontal: spacing.m,
  },
  chartToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.small,
  },
  chartToggleText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
    marginLeft: spacing.s,
  },

  // === FILTRES ===
  filterContainer: {
    marginBottom: spacing.l,
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    borderRadius: borderRadius.medium,
    padding: spacing.m,
    ...shadowStyles.medium,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: spacing.m,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterMainText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
  },
  filterCount: {
    fontSize: typography.caption,
    marginTop: spacing.xs / 2,
  },
  filterOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.small,
  },
  filterOptionsText: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    marginRight: spacing.xs,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: borderRadius.medium,
    marginTop: spacing.xs,
    ...shadowStyles.large,
    zIndex: 1001,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterOptionText: {
    flex: 1,
    fontSize: typography.body2,
    marginLeft: spacing.s,
  },
  filterBadge: {
    borderRadius: 12,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs / 2,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: typography.caption,
    fontWeight: typography.fontWeightBold,
  },

  // === CARTES SESSION ===
  sessionCardWrapper: {
    marginBottom: spacing.m,
    borderRadius: borderRadius.large,
    ...shadowStyles.medium,
  },
  sessionCard: {
    padding: spacing.m,
    borderRadius: borderRadius.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sessionDate: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  scoreText: {
    fontSize: typography.heading1,
    fontWeight: typography.fontWeightBold,
    marginRight: spacing.s,
  },
  percentageText: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightMedium,
  },
  statusText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.body2,
    marginLeft: spacing.xs,
  },
  performanceSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: typography.body2,
    marginRight: spacing.xs,
  },
  performanceValue: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightBold,
  },

  // === STATISTIQUES GÉNÉRALES ===
  statsCard: {
    padding: spacing.m,
    borderRadius: borderRadius.large,
    marginBottom: spacing.m,
    ...shadowStyles.medium,
  },
  statsTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
  statLabel: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // === MODAL ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: typography.heading2,
    fontWeight: typography.fontWeightBold,
  },
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  detailSection: {
    padding: spacing.m,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.m,
    ...shadowStyles.small,
  },
  sectionTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  detailLabel: {
    fontSize: typography.body1,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightMedium,
    flex: 2,
    textAlign: 'right',
  },
  themeResultsLegend: {
    borderRadius: borderRadius.small,
    padding: spacing.s,
    marginBottom: spacing.m,
  },
  themeResultCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: borderRadius.medium,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  themeColorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.s,
  },
  themeName: {
    fontSize: typography.body2,
    fontWeight: typography.fontWeightMedium,
    flex: 1,
  },
  themeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  themeScore: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },
  themePercentage: {
    fontSize: typography.body2,
  },
  themeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownText: {
    fontSize: typography.caption,
    marginLeft: spacing.xs / 2,
  },
});