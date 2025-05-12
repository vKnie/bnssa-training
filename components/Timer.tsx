import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TextStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';

// Importation des éléments du thème (si disponible)
try {
  var { 
    typography, 
    spacing, 
    getThemeForScreen 
  } = require('../components/themes');
} catch (error) {
  // Si l'import échoue, on utilise les valeurs par défaut
}

// Définition des valeurs par défaut
const defaultSpacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
};

const defaultTypography = {
  heading1: 24,
  heading2: 20,
  body1: 16,
};

const defaultColors = {
  primary: '#3099EF',
  warning: '#FFA000',
  error: '#F44336',
  text: '#333333',
};

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const route = useRoute();
  // Obtenir le thème si disponible
  const theme = getThemeForScreen ? getThemeForScreen(route.name) : null;
  
  // Animation pour la progress
  const animatedValue = useRef(new Animated.Value(timeLeft / totalTime)).current;
  
  // Animation pour le pulse sur les dernières minutes
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const [colorTransition, setColorTransition] = useState({
    color: theme?.primary || defaultColors.primary,
    textColor: theme?.text || defaultColors.text
  });

  // Démarrer l'animation de pulse quand il reste moins de 5 minutes
  useEffect(() => {
    if (timeLeft <= 300) { // 5 minutes
      const warningColor = theme?.warning || defaultColors.warning;
      setColorTransition({ color: warningColor, textColor: warningColor });

      // Créer une animation de pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    }

    // Rouge clignotant pour la dernière minute
    if (timeLeft <= 60) {
      const errorColor = theme?.error || defaultColors.error;
      setColorTransition({ color: errorColor, textColor: errorColor });
      
      // Pulse plus rapide
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [timeLeft <= 300, timeLeft <= 60]);

  // Mettre à jour l'animation du cercle
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: timeLeft / totalTime,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, totalTime]);

  const circleSize = 120;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculer le pourcentage de temps restant
  const percentageLeft = Math.round((timeLeft / totalTime) * 100);
  
  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerLabelContainer}>
        <Text style={styles.timerLabel}>Temps restant</Text>
      </View>

      <View style={styles.timerCircleContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
            <G rotation="-90" origin={`${circleSize / 2}, ${circleSize / 2}`}>
              {/* Cercle de fond */}
              <Circle
                stroke="#E0E0E0"
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              
              {/* Cercle animé de progression */}
              <AnimatedCircle
                stroke={colorTransition.color}
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
        </Animated.View>

        <View style={styles.timerTextContainer}>
          <Animated.Text style={[styles.timerText, { color: colorTransition.textColor }]}>
            {formatTime(timeLeft)}
          </Animated.Text>
          <Text style={styles.timerPercentage}>{percentageLeft}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: { 
    marginVertical: spacing?.m || defaultSpacing.m, 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%',
  },
  timerLabelContainer: {
    marginBottom: spacing?.s || defaultSpacing.s,
  },
  timerLabel: {
    fontSize: typography?.body1 || defaultTypography.body1,
    color: '#666',
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  timerCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { 
    fontSize: typography?.heading1 || defaultTypography.heading1, 
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  timerPercentage: {
    fontSize: typography?.body1 || defaultTypography.body1,
    color: '#888',
    marginTop: spacing?.xs || defaultSpacing.xs,
  },
});

export default Timer;