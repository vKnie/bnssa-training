// components/HistoricComponents.tsx
import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { 
  Line, 
  Circle, 
  Text as SvgText, 
  Polyline, 
  Defs, 
  LinearGradient, 
  Stop,
  Rect,
  Path,
  Filter,
  FeDropShadow
} from 'react-native-svg';

import { 
  shadowStyles, 
  typography, 
  spacing, 
  borderRadius,
} from './themes';
import { ExamSession } from '../services/DatabaseService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ✅ NOUVEAU : Utilitaires de formatage uniformisés
const formatUtils = {
  // Formatage de durée uniforme avec validation stricte
  formatDuration: (duration: any): string => {
    try {
      // Conversion sécurisée en nombre
      let seconds = Number(duration);
      
      // Validation stricte
      if (!duration && duration !== 0) {
        console.warn('⚠️ Durée undefined/null:', duration);
        return "0:00";
      }
      
      if (isNaN(seconds) || seconds < 0) {
        console.warn('⚠️ Durée invalide:', duration, 'convertie en:', seconds);
        return "0:00";
      }
      
      // Conversion en entier pour éviter les décimales
      seconds = Math.floor(seconds);
      
      // Calcul des unités de temps
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      // Format selon la durée
      if (hours > 0) {
        // Format: "1h 23min" ou "1h 00min"
        return `${hours}h ${String(minutes).padStart(2, '0')}min`;
      } else {
        // Format: "23:45" ou "5:30"
        return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('❌ Erreur formatage durée:', error, 'pour:', duration);
      return "0:00";
    }
  },

  // Formatage de durée courte pour les espaces restreints
  formatDurationShort: (duration: any): string => {
    try {
      let seconds = Number(duration);
      
      if (!duration && duration !== 0) return "0min";
      if (isNaN(seconds) || seconds < 0) return "0min";
      
      seconds = Math.floor(seconds);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes === 0) {
        return `${seconds}s`;
      } else if (minutes < 60) {
        return `${minutes}min`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h${remainingMinutes > 0 ? `${remainingMinutes}min` : ''}`;
      }
    } catch (error) {
      console.error('❌ Erreur formatage durée courte:', error);
      return "0min";
    }
  },

  // Formatage de date sécurisé
  formatDate: (dateString: any): string => {
    try {
      if (!dateString) {
        console.warn('⚠️ Date manquante');
        return "Date non disponible";
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Date invalide:', dateString);
        return "Date invalide";
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Erreur formatage date:', error);
      return "Date invalide";
    }
  },

  // Validation et nettoyage des sessions
  validateSession: (session: any, index: number): any => {
    if (!session || typeof session !== 'object') {
      console.warn(`⚠️ Session ${index} invalide:`, session);
      return null;
    }

    const validatedSession = {
      ...session,
      // Validation stricte des nombres
      score: (() => {
        const s = Number(session.score);
        return isNaN(s) ? 0 : Math.max(0, Math.min(40, s)); // Score entre 0 et 40
      })(),
      successRate: (() => {
        const sr = Number(session.successRate);
        return isNaN(sr) ? 0 : Math.max(0, Math.min(100, sr)); // Pourcentage entre 0 et 100
      })(),
      duration: (() => {
        const d = Number(session.duration);
        const validDuration = isNaN(d) ? 0 : Math.max(0, d); // Durée positive
        if (validDuration !== d) {
          console.warn(`⚠️ Session ${index} durée corrigée:`, d, '→', validDuration);
        }
        return validDuration;
      })(),
      // Validation des booléens
      isPassed: Boolean(session.isPassed),
      // Validation des dates
      examDate: session.examDate || new Date().toISOString(),
      // Métadonnées utiles
      originalIndex: index,
      isValid: true
    };

    // Log des corrections appliquées
    if (validatedSession.score !== session.score || 
        validatedSession.successRate !== session.successRate || 
        validatedSession.duration !== session.duration) {
      console.log(`🔧 Session ${index} corrigée:`, {
        score: `${session.score} → ${validatedSession.score}`,
        successRate: `${session.successRate} → ${validatedSession.successRate}`,
        duration: `${session.duration} → ${validatedSession.duration}`
      });
    }

    return validatedSession;
  }
};

// Système responsive avancé
const breakpoints = {
  small: 350,
  medium: 400,
  large: 500,
  xlarge: 600
};

const getScreenSize = () => {
  if (screenWidth < breakpoints.small) return 'xs';
  if (screenWidth < breakpoints.medium) return 'sm';
  if (screenWidth < breakpoints.large) return 'md';
  if (screenWidth < breakpoints.xlarge) return 'lg';
  return 'xl';
};

const responsive = {
  xs: { padding: 20, fontSize: 10, iconSize: 16, pointSize: 6, labelHeight: 16, margin: 3 },
  sm: { padding: 25, fontSize: 11, iconSize: 18, pointSize: 7, labelHeight: 18, margin: 4 },
  md: { padding: 30, fontSize: 12, iconSize: 20, pointSize: 8, labelHeight: 20, margin: 5 },
  lg: { padding: 35, fontSize: 13, iconSize: 22, pointSize: 9, labelHeight: 22, margin: 6 },
  xl: { padding: 40, fontSize: 14, iconSize: 24, pointSize: 10, labelHeight: 24, margin: 8 }
};

const currentSize = getScreenSize();
const config = responsive[currentSize];

// === COMPOSANT LISTE COMPLÈTE DES EXAMENS - VERSION CORRIGÉE ===
const AllExamsList: React.FC<{
  sessions: ExamSession[];
  theme: any;
}> = ({ sessions, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ MODIFIÉ : Utilisation des utilitaires unifiés
  const validSessions = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) {
      console.warn('⚠️ Sessions invalides:', sessions);
      return [];
    }
    
    const validated = sessions
      .map((session, index) => formatUtils.validateSession(session, index))
      .filter(Boolean);
    
    console.log(`✅ ${validated.length}/${sessions.length} sessions validées`);
    return validated;
  }, [sessions]);

  if (validSessions.length === 0) {
    return (
      <View style={[styles.allExamsContainer, { backgroundColor: theme.card }]}>
        <View style={styles.allExamsHeader}>
          <Icon name="list" size={24} color={theme.primary} />
          <Text style={[styles.allExamsTitle, { color: theme.text }]}>
            Historique complet
          </Text>
        </View>
        <View style={styles.emptyExamsList}>
          <Icon name="inbox" size={48} color={theme.textLight} />
          <Text style={[styles.emptyExamsText, { color: theme.textLight }]}>
            Aucun examen dans l'historique
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.allExamsContainer, { backgroundColor: theme.card }]}>
      {/* Header premium avec gradient */}
      <View style={[styles.allExamsHeaderPremium, { backgroundColor: theme.primary }]}>
        <View style={styles.allExamsHeaderContent}>
          <View style={styles.allExamsHeaderIcon}>
            <Icon name="history" size={config.iconSize + 2} color="#FFFFFF" />
          </View>
          <View style={styles.allExamsHeaderText}>
            <Text style={styles.allExamsHeaderTitle}>Historique complet</Text>
            <Text style={styles.allExamsHeaderSubtitle}>
              {validSessions.length} session{validSessions.length > 1 ? 's' : ''} • Performances détaillées
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.allExamsToggleButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Icon 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.allExamsHeaderDecoration, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      </View>

      {/* Liste des examens avec style premium */}
      {isExpanded && (
        <View style={styles.allExamsListContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.allExamsScrollView}
            contentContainerStyle={styles.allExamsScrollContent}
            nestedScrollEnabled={true}
          >
            {validSessions.map((item, index) => {
              const examNumber = validSessions.length - index;
              const isPass = item.isPassed;
              
              return (
                <View key={`exam-safe-${index}-${item.originalIndex}-${item.score}`}>
                  <View style={[styles.premiumExamItem, { 
                    backgroundColor: theme.card,
                    borderLeftColor: isPass ? theme.success : theme.error,
                  }]}>
                    <View style={styles.premiumExamHeader}>
                      <View style={[styles.premiumExamBadge, { 
                        backgroundColor: isPass ? theme.success : theme.error,
                      }]}>
                        <Text style={styles.premiumExamNumber}>
                          E{examNumber}
                        </Text>
                      </View>
                      
                      <View style={styles.premiumExamInfo}>
                        <View style={styles.premiumExamScoreRow}>
                          <Text style={[styles.premiumExamScore, { color: theme.text }]}>
                            {item.score}/40
                          </Text>
                          <View style={[styles.premiumPercentageBadge, { 
                            backgroundColor: isPass ? theme.success + '15' : theme.error + '15',
                            borderColor: isPass ? theme.success : theme.error,
                          }]}>
                            <Text style={[styles.premiumPercentageText, { 
                              color: isPass ? theme.success : theme.error 
                            }]}>
                              {Math.round(item.successRate)}%
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.premiumExamDate, { color: theme.textLight }]}>
                          {formatUtils.formatDate(item.examDate)}
                        </Text>
                      </View>

                      <View style={styles.premiumExamStats}>
                        <View style={[styles.premiumStatChip, { backgroundColor: theme.primary + '10' }]}>
                          <Icon name="schedule" size={14} color={theme.primary} />
                          <Text style={[styles.premiumStatText, { color: theme.primary }]}>
                            {/* ✅ CORRIGÉ : Utilisation du formatage unifié */}
                            {formatUtils.formatDurationShort(item.duration)}
                          </Text>
                        </View>
                        <View style={[styles.premiumStatusBadge, { 
                          backgroundColor: isPass ? theme.success : theme.error 
                        }]}>
                          <Icon 
                            name={isPass ? "check" : "close"} 
                            size={12} 
                            color="#FFFFFF" 
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  {index < validSessions.length - 1 && (
                    <View style={styles.premiumExamSeparator} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Footer avec statistiques */}
      <View style={[styles.allExamsFooter, { backgroundColor: '#FAFBFC' }]}>
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.success }]}>
            {validSessions.filter(s => s.isPassed).length}
          </Text>
          <Text style={[styles.quickStatLabel, { color: theme.textLight }]}>
            Réussis
          </Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.error }]}>
            {validSessions.filter(s => !s.isPassed).length}
          </Text>
          <Text style={[styles.quickStatLabel, { color: theme.textLight }]}>
            Échoués
          </Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatNumber, { color: theme.primary }]}>
            {(() => {
              if (validSessions.length === 0) return "0%";
              const avg = validSessions.reduce((sum, s) => sum + s.successRate, 0) / validSessions.length;
              return `${Math.round(avg)}%`;
            })()}
          </Text>
          <Text style={[styles.quickStatLabel, { color: theme.textLight }]}>
            Moyenne
          </Text>
        </View>
      </View>
    </View>
  );
};

// ✅ MODIFIÉ : Modal avec formatage uniforme
const ExamDetailModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  examData: any;
  theme: any;
}> = ({ visible, onClose, examData, theme }) => {
  if (!examData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.modalClose}
            onPress={onClose}
          >
            <Icon name="close" size={20} color={theme.textLight} />
          </TouchableOpacity>
          
          <View style={[styles.modalHeader, { backgroundColor: examData.isPassed ? theme.success : theme.error }]}>
            <Icon 
              name={examData.isPassed ? "check-circle" : "cancel"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.modalTitle}>
              {examData.examLabel}
            </Text>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.modalRow}>
              <Icon name="grade" size={18} color={theme.primary} />
              <Text style={[styles.modalLabel, { color: theme.textLight }]}>Score:</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {examData.score}/40 ({Math.round(examData.successRate)}%)
              </Text>
            </View>
            
            <View style={styles.modalRow}>
              <Icon name="event" size={18} color={theme.primary} />
              <Text style={[styles.modalLabel, { color: theme.textLight }]}>Date:</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {formatUtils.formatDate(examData.sessionData?.examDate || examData.fullDate)}
              </Text>
            </View>
            
            <View style={styles.modalRow}>
              <Icon name="schedule" size={18} color={theme.primary} />
              <Text style={[styles.modalLabel, { color: theme.textLight }]}>Durée:</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {/* ✅ CORRIGÉ : Utilisation du formatage unifié */}
                {formatUtils.formatDuration(examData.sessionData?.duration || examData.duration)}
              </Text>
            </View>
            
            <View style={[styles.modalStatus, { 
              backgroundColor: examData.isPassed ? theme.success + '15' : theme.error + '15',
              borderColor: examData.isPassed ? theme.success : theme.error
            }]}>
              <Text style={[styles.modalStatusText, { 
                color: examData.isPassed ? theme.success : theme.error 
              }]}>
                {examData.isPassed ? 'Examen réussi' : 'Examen échoué'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// === COMPOSANT GRAPHIQUE ULTRA MODERNE ===
const ProgressChart: React.FC<{
  sessions: ExamSession[];
  theme: any;
  insets?: any;
}> = ({ sessions, theme, insets }) => {
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ MODIFIÉ : Utilisation des utilitaires de validation
  const chartData = useMemo(() => {
    if (!sessions.length) return [];
    
    // Validation des sessions avant traitement
    const validSessions = sessions
      .map((session, index) => formatUtils.validateSession(session, index))
      .filter(Boolean);
    
    if (!validSessions.length) {
      console.warn('⚠️ Aucune session valide pour le graphique');
      return [];
    }
    
    const recentSessions = validSessions.slice(0, 6).reverse();
    const chartWidth = screenWidth - (config.margin * 4);
    const chartHeight = currentSize === 'xs' ? 260 : currentSize === 'sm' ? 300 : currentSize === 'md' ? 340 : 380;
    const padding = config.padding;
    
    const maxScore = 40;
    const minScore = 0;
    
    // Calcul du numéro de départ des examens
    const startExamNumber = Math.max(1, validSessions.length - 5);
    
    return recentSessions.map((session, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / Math.max(recentSessions.length - 1, 1);
      const y = chartHeight - 80 - ((session.score - minScore) / (maxScore - minScore)) * (chartHeight - padding - 80);
      
      return {
        x,
        y,
        score: session.score,
        successRate: session.successRate,
        examLabel: `E${startExamNumber + index}`,
        fullDate: formatUtils.formatDate(session.examDate),
        duration: session.duration, // Durée en secondes
        isPassed: session.isPassed,
        sessionData: session
      };
    });
  }, [sessions]);

  const handlePointPress = (pointData: any) => {
    setSelectedExam(pointData);
    setModalVisible(true);
  };

  if (!chartData.length) {
    return (
      <View style={[styles.modernContainer, { backgroundColor: theme.card }]}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
            <Icon name="show-chart" size={currentSize === 'xs' ? 40 : 48} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Aucune donnée
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textLight }]}>
            Passez votre premier examen pour voir l'évolution
          </Text>
        </View>
      </View>
    );
  }

  const chartWidth = screenWidth - (config.margin * 4);
  const chartHeight = currentSize === 'xs' ? 260 : currentSize === 'sm' ? 300 : currentSize === 'md' ? 340 : 380;
  const padding = config.padding;
  const passLineY = chartHeight - 80 - ((30 - 0) / (40 - 0)) * (chartHeight - padding - 80);

  return (
    <>
      <View style={[styles.modernContainer, { backgroundColor: theme.card }]}>
        {/* Header moderne avec gradient */}
        <View style={[styles.modernHeader, { backgroundColor: theme.primary }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Icon name="trending-up" size={config.iconSize + 4} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Évolution des Scores</Text>
              <Text style={styles.headerSubtitle}>
                {chartData.length} derniers examens • Objectif: 30/40
              </Text>
            </View>
          </View>
          <View style={[styles.headerDecoration, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        </View>
        
        {/* Zone graphique adaptée */}
        <View style={[styles.chartWrapper, { paddingHorizontal: config.margin }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: config.margin }}
          >
            <View style={{ position: 'relative' }}>
              <Svg width={Math.max(chartWidth, screenWidth * 0.8)} height={chartHeight} style={styles.modernChart}>
                <Defs>
                  {/* Gradients modernes */}
                  <LinearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={theme.primary} stopOpacity="1" />
                    <Stop offset="50%" stopColor={theme.primary} stopOpacity="0.9" />
                    <Stop offset="100%" stopColor={theme.secondary || theme.primary} stopOpacity="0.8" />
                  </LinearGradient>
                  
                  <LinearGradient id="successZone" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={theme.success} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={theme.success} stopOpacity="0.05" />
                  </LinearGradient>
                  
                  <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.08" />
                  </LinearGradient>

                  {/* Filtres pour ombres */}
                  <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </Filter>
                </Defs>

                {/* Grille horizontale élégante */}
                {[0, 10, 20, 30, 40].map(score => {
                  const y = chartHeight - 80 - ((score - 0) / (40 - 0)) * (chartHeight - padding - 80);
                  const isPassLine = score === 30;
                  const isMaxLine = score === 40;
                  
                  return (
                    <React.Fragment key={`grid-${score}`}>
                      <Line
                        x1={padding}
                        y1={y}
                        x2={Math.max(chartWidth, screenWidth * 0.8) - padding}
                        y2={y}
                        stroke={isPassLine ? theme.success : isMaxLine ? theme.primary : '#F1F5F9'}
                        strokeWidth={isPassLine || isMaxLine ? "2" : "1"}
                        strokeDasharray={isPassLine ? "8,4" : "none"}
                        opacity={isPassLine ? 0.9 : isMaxLine ? 0.6 : 0.4}
                      />
                      <SvgText
                        x={padding - 8}
                        y={y + 4}
                        fontSize={config.fontSize}
                        fill={isPassLine ? theme.success : isMaxLine ? theme.primary : theme.textLight}
                        textAnchor="end"
                        fontWeight={isPassLine || isMaxLine ? "bold" : "normal"}
                      >
                        {score}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                
                {/* Zone de réussite avec gradient */}
                <Rect
                  x={padding}
                  y={padding}
                  width={Math.max(chartWidth, screenWidth * 0.8) - padding * 2}
                  height={passLineY - padding}
                  fill="url(#successZone)"
                  rx="8"
                />
                
                {/* Aire sous la courbe */}
                {chartData.length > 1 && (
                  <Path
                    d={`M ${chartData[0].x} ${chartHeight - 80} 
                        ${chartData.map(point => `L ${point.x} ${point.y}`).join(' ')}
                        L ${chartData[chartData.length - 1].x} ${chartHeight - 80} Z`}
                    fill="url(#areaGradient)"
                  />
                )}
                
                {/* Lignes verticales pour les examens */}
                {chartData.map((point, index) => (
                  <Line
                    key={`vertical-${index}`}
                    x1={point.x}
                    y1={padding}
                    x2={point.x}
                    y2={chartHeight - 80}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3,4"
                    opacity={0.3}
                  />
                ))}
                
                {/* Ligne principale avec style moderne */}
                {chartData.length > 1 && (
                  <Polyline
                    points={chartData.map(point => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="url(#primaryGradient)"
                    strokeWidth={currentSize === 'xs' ? 3 : currentSize === 'sm' ? 4 : 5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#shadow)"
                  />
                )}
                
                {/* Axes avec style moderne (placés AVANT les points) */}
                <Line
                  x1={padding}
                  y1={padding}
                  x2={padding}
                  y2={chartHeight - 80}
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <Line
                  x1={padding}
                  y1={chartHeight - 80}
                  x2={Math.max(chartWidth, screenWidth * 0.8) - padding}
                  y2={chartHeight - 80}
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                
                {/* Points de données cliquables (maintenant au-dessus des axes) */}
                {chartData.map((point, index) => (
                  <React.Fragment key={`point-${index}`}>
                    {/* Halo extérieur */}
                    <Circle
                      cx={point.x}
                      cy={point.y + 1}
                      r={config.pointSize}
                      fill="#000000"
                      opacity={0.2}
                    />
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={config.pointSize}
                      fill={point.isPassed ? theme.success : theme.error}
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />
                    {/* Point central lumineux */}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={config.pointSize - 4}
                      fill="#FFFFFF"
                      opacity={0.9}
                    />
                  </React.Fragment>
                ))}
                
                {/* Labels d'examens en bas (remontés) */}
                {chartData.map((point, index) => {
                  const labelWidth = currentSize === 'xs' ? 28 : 32;
                  const labelHeight = config.labelHeight;
                  const yPosition = chartHeight - 65; // Remonté de 20px (était à -45)
                  
                  return (
                    <React.Fragment key={`exam-label-${index}`}>
                      {/* Bulle du label d'examen */}
                      <Rect
                        x={point.x - labelWidth/2}
                        y={yPosition}
                        width={labelWidth}
                        height={labelHeight}
                        fill={point.isPassed ? theme.success + '20' : theme.error + '20'}
                        stroke={point.isPassed ? theme.success : theme.error}
                        strokeWidth="1"
                        rx={labelHeight/2}
                      />
                      <SvgText
                        x={point.x}
                        y={yPosition + labelHeight/2 + 4}
                        fontSize={config.fontSize}
                        fill={point.isPassed ? theme.success : theme.error}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {point.examLabel}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                
                {/* Label "Score" moderne (déplacé vers la droite) */}
                <SvgText
                  x={padding + 15} // Déplacé de 23px vers la droite (était à padding - 8)
                  y={padding - 15}
                  fontSize={config.fontSize + 1}
                  fill={theme.primary}
                  textAnchor="start" // Changé de "end" à "start" pour alignement à gauche
                  fontWeight="700"
                >
                  Score
                </SvgText>
                
                {/* Label "Examens" centré */}
                <SvgText
                  x={Math.max(chartWidth, screenWidth * 0.8) / 2}
                  y={chartHeight - 8}
                  fontSize={config.fontSize + 1}
                  fill={theme.primary}
                  textAnchor="middle"
                  fontWeight="700"
                >
                  Examens
                </SvgText>
              </Svg>
              
              {/* Points cliquables en overlay React Native (position ajustée) */}
              {chartData.map((point, index) => (
                <TouchableOpacity
                  key={`touch-${index}`}
                  style={{
                    position: 'absolute',
                    left: point.x - 20,
                    top: point.y - 20,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'transparent',
                  }}
                  onPress={() => handlePointPress(point)}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Footer statistiques premium */}
        <View style={[styles.statsFooter, { backgroundColor: '#FAFBFC' }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {sessions.length >= 2 ? 
                (sessions[0].score > sessions[sessions.length - 1].score ? '+' : '') +
                (sessions[0].score - sessions[sessions.length - 1].score) : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Évolution</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {sessions.length ? Math.max(...sessions.map(s => s.score)) : 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Record</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {sessions.length ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length) : 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textLight }]}>Moyenne</Text>
          </View>
        </View>
        
        {/* Instruction d'utilisation */}
        <View style={[styles.instructionBanner, { backgroundColor: theme.primary + '10' }]}>
          <Icon name="touch-app" size={16} color={theme.primary} />
          <Text style={[styles.instructionText, { color: theme.primary }]}>
            Appuyez sur un point pour voir les détails de l'examen
          </Text>
        </View>
      </View>
      
      {/* Modal de détails d'examen */}
      <ExamDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        examData={selectedExam}
        theme={theme}
      />
    </>
  );
};

// === CARTE STATISTIQUES GÉNÉRALES PREMIUM ===
export const StatsOverviewCard: React.FC<{
  stats: any;
  sessions: ExamSession[];
  theme: any;
  insets?: any;
}> = ({ stats, sessions, theme, insets }) => {
  
  // ✅ MODIFIÉ : Utilisation des utilitaires de validation
  const additionalStats = useMemo(() => {
    if (!sessions.length) return {};
    
    // Validation des sessions
    const validSessions = sessions
      .map((session, index) => formatUtils.validateSession(session, index))
      .filter(Boolean);
    
    if (!validSessions.length) return {};
    
    const avgDuration = validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length;
    const bestScore = Math.max(...validSessions.map(s => s.successRate));
    const recentSessions = validSessions.slice(0, 5);
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.successRate, 0) / recentSessions.length;
    
    return {
      avgDuration: Math.round(avgDuration / 60), // En minutes
      bestScore: Math.round(bestScore),
      recentAvg: Math.round(recentAvg),
      improvement: validSessions.length >= 2 ? 
        Math.round(validSessions[0].successRate - validSessions[validSessions.length - 1].successRate) : 0
    };
  }, [sessions]);

  const statsItems = [
    {
      icon: 'quiz',
      value: stats?.totalExams || 0,
      label: 'Examens',
      color: theme.primary,
      suffix: ''
    },
    {
      icon: 'check-circle',
      value: stats?.passedExams || 0,
      label: 'Réussis',
      color: theme.success,
      suffix: ''
    },
    {
      icon: 'emoji-events',
      value: additionalStats.bestScore || 0,
      label: 'Meilleur',
      color: '#3B82F6',
      suffix: '%'
    },
    {
      icon: 'schedule',
      value: additionalStats.avgDuration || 0,
      label: 'Temps moy.',
      color: '#F59E0B',
      suffix: 'min'
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Carte statistiques ultra moderne avec adaptation SafeArea */}
      <View style={[
        styles.overviewCard, 
        { backgroundColor: theme.card },
        {
          marginHorizontal: config.margin,
          marginTop: insets ? Math.max(insets.top / 4, spacing.xs) : spacing.xs
        }
      ]}>
        <View style={[styles.overviewHeader, { backgroundColor: theme.primary }]}>
          <View style={styles.overviewIcon}>
            <Icon name="dashboard" size={config.iconSize} color="#FFFFFF" />
          </View>
          <View style={styles.overviewText}>
            <Text style={styles.overviewTitle}>Vue d'ensemble</Text>
            <Text style={styles.overviewSubtitle}>Performances globales</Text>
          </View>
        </View>
        
        {/* Grille statistiques responsive */}
        <View style={[
          styles.statsGrid,
          currentSize === 'xs' && styles.statsGridVertical
        ]}>
          {statsItems.map((item, index) => (
            <View key={index} style={[
              styles.statItemCard,
              currentSize === 'xs' && styles.statItemHorizontal
            ]}>
              <View style={[styles.statIconWrapper, { backgroundColor: item.color + '15' }]}>
                <Icon name={item.icon} size={config.iconSize - 2} color={item.color} />
              </View>
              <View style={currentSize === 'xs' ? styles.statTextWrapper : {}}>
                <Text style={[styles.statValue, { color: item.color }]}>
                  {item.value}{item.suffix}
                </Text>
                <Text style={[styles.statText, { color: theme.textLight }]}>
                  {item.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bannière d'amélioration premium */}
        {additionalStats.improvement !== 0 && (
          <View style={[styles.improvementCard, { 
            backgroundColor: (additionalStats.improvement ?? 0) > 0 ? theme.success + '10' : theme.error + '10' 
          }]}>
            <View style={[styles.improvementIconWrapper, {
              backgroundColor: (additionalStats.improvement ?? 0) > 0 ? theme.success : theme.error
            }]}>
              <Icon 
                name={(additionalStats.improvement ?? 0) > 0 ? 'trending-up' : 'trending-down'} 
                size={18} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.improvementContent}>
              <Text style={[styles.improvementTitle, { 
                color: (additionalStats.improvement ?? 0) > 0 ? theme.success : theme.error 
              }]}>
                {(additionalStats.improvement ?? 0) > 0 ? 'Progression' : 'Régression'}
              </Text>
              <Text style={[styles.improvementText, { 
                color: (additionalStats.improvement ?? 0) > 0 ? theme.success : theme.error 
              }]}>
                {(additionalStats.improvement ?? 0) > 0 ? '+' : ''}{additionalStats.improvement ?? 0}% depuis le début
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Graphique de progression avec adaptation SafeArea */}
      <ProgressChart sessions={sessions} theme={theme} insets={insets} />
      
      {/* Liste complète des examens */}
      <AllExamsList sessions={sessions} theme={theme} />
    </View>
  );
};

// === STYLES ULTRA MODERNES ET RESPONSIVE ===
const styles = StyleSheet.create({
  // Container principal moderne avec adaptation responsive
  modernContainer: {
    borderRadius: 20,
    marginHorizontal: config.margin,
    marginVertical: spacing.s,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  // Header avec gradient adaptatif
  modernHeader: {
    paddingVertical: currentSize === 'xs' ? spacing.s : spacing.m,
    paddingHorizontal: spacing.s,
    position: 'relative',
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  
  headerIcon: {
    width: currentSize === 'xs' ? 36 : 44,
    height: currentSize === 'xs' ? 36 : 44,
    borderRadius: currentSize === 'xs' ? 18 : 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  
  headerText: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: currentSize === 'xs' ? 14 : currentSize === 'sm' ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  
  headerSubtitle: {
    fontSize: currentSize === 'xs' ? 11 : 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: currentSize === 'xs' ? 60 : 80,
    height: currentSize === 'xs' ? 60 : 80,
    borderRadius: currentSize === 'xs' ? 30 : 40,
    transform: [
      { translateX: currentSize === 'xs' ? 20 : 25 }, 
      { translateY: currentSize === 'xs' ? -20 : -25 }
    ],
  },

  // Zone graphique avec adaptation responsive
  chartWrapper: {
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  
  modernChart: {
    backgroundColor: 'transparent',
  },

  // Bannière d'instruction
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },

  instructionText: {
    fontSize: currentSize === 'xs' ? 11 : 12,
    fontWeight: '500',
    marginLeft: spacing.xs,
    textAlign: 'center',
  },

  // Footer statistiques adaptatif
  statsFooter: {
    flexDirection: 'row',
    paddingVertical: currentSize === 'xs' ? spacing.s : spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: spacing.xs,
  },
  
  statNumber: {
    fontSize: currentSize === 'xs' ? 16 : currentSize === 'sm' ? 18 : 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  statLabel: {
    fontSize: currentSize === 'xs' ? 10 : 11,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },

  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  modalClose: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },

  modalTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    color: '#FFFFFF',
    marginLeft: spacing.s,
  },

  modalBody: {
    padding: spacing.l,
  },

  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },

  modalLabel: {
    fontSize: typography.body2,
    marginLeft: spacing.s,
    marginRight: spacing.s,
    flex: 1,
  },

  modalValue: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
    flex: 2,
  },

  modalStatus: {
    marginTop: spacing.m,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },

  modalStatusText: {
    fontSize: typography.body1,
    fontWeight: typography.fontWeightBold,
  },

  // État vide adaptatif
  emptyState: {
    alignItems: 'center',
    paddingVertical: currentSize === 'xs' ? spacing.xl : spacing.xl * 1.5,
    paddingHorizontal: spacing.m,
  },
  
  emptyIcon: {
    width: currentSize === 'xs' ? 60 : 80,
    height: currentSize === 'xs' ? 60 : 80,
    borderRadius: currentSize === 'xs' ? 30 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  
  emptyTitle: {
    fontSize: currentSize === 'xs' ? 14 : 16,
    fontWeight: '600',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: currentSize === 'xs' ? 11 : 13,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },

  // Carte overview avec adaptation SafeArea
  overviewCard: {
    borderRadius: 20,
    marginBottom: spacing.s,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
  },
  
  overviewIcon: {
    width: currentSize === 'xs' ? 32 : 40,
    height: currentSize === 'xs' ? 32 : 40,
    borderRadius: currentSize === 'xs' ? 16 : 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  
  overviewText: {
    flex: 1,
  },
  
  overviewTitle: {
    fontSize: currentSize === 'xs' ? 14 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  overviewSubtitle: {
    fontSize: currentSize === 'xs' ? 11 : 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Grille statistiques responsive
  statsGrid: {
    flexDirection: 'row',
    padding: spacing.s,
    justifyContent: 'space-between',
  },
  
  statsGridVertical: {
    flexDirection: 'column',
  },
  
  statItemCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  
  statItemHorizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingHorizontal: spacing.xs,
  },
  
  statIconWrapper: {
    width: currentSize === 'xs' ? 28 : 32,
    height: currentSize === 'xs' ? 28 : 32,
    borderRadius: currentSize === 'xs' ? 14 : 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: currentSize === 'xs' ? spacing.xs / 2 : spacing.xs,
  },
  
  statTextWrapper: {
    marginLeft: spacing.s,
    alignItems: 'flex-start',
  },
  
  statValue: {
    fontSize: currentSize === 'xs' ? 14 : currentSize === 'sm' ? 16 : 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  statText: {
    fontSize: currentSize === 'xs' ? 9 : 10,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },

  // Bannière d'amélioration responsive
  improvementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.s,
    marginTop: 0,
    padding: spacing.s,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  
  improvementIconWrapper: {
    width: currentSize === 'xs' ? 28 : 32,
    height: currentSize === 'xs' ? 28 : 32,
    borderRadius: currentSize === 'xs' ? 14 : 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  
  improvementContent: {
    flex: 1,
  },
  
  improvementTitle: {
    fontSize: currentSize === 'xs' ? 12 : 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  improvementText: {
    fontSize: currentSize === 'xs' ? 10 : 12,
    fontWeight: '500',
    opacity: 0.8,
  },

  // === STYLES PREMIUM POUR HISTORIQUE COMPLET ===
  allExamsHeaderPremium: {
    paddingVertical: currentSize === 'xs' ? spacing.s : spacing.m,
    paddingHorizontal: spacing.m,
    position: 'relative',
    overflow: 'hidden',
  },

  allExamsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  allExamsHeaderIcon: {
    width: currentSize === 'xs' ? 36 : 42,
    height: currentSize === 'xs' ? 36 : 42,
    borderRadius: currentSize === 'xs' ? 18 : 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },

  allExamsHeaderText: {
    flex: 1,
  },

  allExamsHeaderTitle: {
    fontSize: currentSize === 'xs' ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  allExamsHeaderSubtitle: {
    fontSize: currentSize === 'xs' ? 12 : 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },

  allExamsToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  allExamsHeaderDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: currentSize === 'xs' ? 60 : 80,
    height: currentSize === 'xs' ? 60 : 80,
    borderRadius: currentSize === 'xs' ? 30 : 40,
  },

  allExamsListContainer: {
    backgroundColor: '#FFFFFF',
  },

  allExamsScrollView: {
    maxHeight: 400,
  },

  allExamsScrollContent: {
    padding: spacing.m,
  },

  premiumExamItem: {
    borderRadius: 16,
    padding: spacing.m,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderLeftWidth: 4,
  },

  premiumExamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  premiumExamBadge: {
    width: currentSize === 'xs' ? 42 : 48,
    height: currentSize === 'xs' ? 42 : 48,
    borderRadius: currentSize === 'xs' ? 21 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  premiumExamNumber: {
    fontSize: currentSize === 'xs' ? 14 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  premiumExamInfo: {
    flex: 1,
  },

  premiumExamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  premiumExamScore: {
    fontSize: currentSize === 'xs' ? 18 : 20,
    fontWeight: '700',
    marginRight: spacing.m,
  },

  premiumPercentageBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },

  premiumPercentageText: {
    fontSize: currentSize === 'xs' ? 12 : 14,
    fontWeight: '600',
  },

  premiumExamDate: {
    fontSize: currentSize === 'xs' ? 12 : 13,
    fontWeight: '500',
  },

  premiumExamStats: {
    alignItems: 'flex-end',
  },

  premiumStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },

  premiumStatText: {
    fontSize: currentSize === 'xs' ? 11 : 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  premiumStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  premiumExamSeparator: {
    height: spacing.m,
  },

  // === STYLES POUR LA LISTE COMPLÈTE DES EXAMENS ===
  allExamsContainer: {
    borderRadius: 20,
    marginHorizontal: config.margin,
    marginVertical: spacing.s,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  allExamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  allExamsTitle: {
    fontSize: currentSize === 'xs' ? 16 : 18,
    fontWeight: '700',
    marginLeft: spacing.s,
    flex: 1,
  },

  allExamsFooter: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },

  quickStat: {
    flex: 1,
    alignItems: 'center',
  },

  quickStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: spacing.s,
  },

  quickStatNumber: {
    fontSize: currentSize === 'xs' ? 16 : 18,
    fontWeight: '700',
    marginBottom: 2,
  },

  quickStatLabel: {
    fontSize: currentSize === 'xs' ? 10 : 11,
    fontWeight: '500',
  },

  emptyExamsList: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },

  emptyExamsText: {
    fontSize: currentSize === 'xs' ? 14 : 16,
    marginTop: spacing.m,
    fontWeight: '500',
  },
});