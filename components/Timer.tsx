// components/Timer.tsx
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';

import { typography, spacing, getThemeForScreen } from './themes';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const route = useRoute();
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  
  const animatedValue = useRef(new Animated.Value(timeLeft / totalTime)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  const { color, textColor, shouldPulse } = useMemo(() => {
    if (timeLeft <= 60) {
      return {
        color: theme.error,
        textColor: theme.error,
        shouldPulse: true,
      };
    } else if (timeLeft <= 300) {
      return {
        color: theme.warning || '#FFA000',
        textColor: theme.warning || '#FFA000',
        shouldPulse: true,
      };
    }
    return {
      color: theme.primary,
      textColor: theme.text,
      shouldPulse: false,
    };
  }, [timeLeft, theme]);

  const percentageLeft = useMemo(() => 
    Math.round((timeLeft / totalTime) * 100), 
    [timeLeft, totalTime]
  );

  // Animation du cercle de progression
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: timeLeft / totalTime,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, totalTime, animatedValue]);

  // Animation de pulse
  useEffect(() => {
    if (shouldPulse) {
      const duration = timeLeft <= 60 ? 500 : 800;
      const scale = timeLeft <= 60 ? 1.2 : 1.1;
      
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: scale,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [shouldPulse, timeLeft, pulseAnim]);

  const circleSize = 80;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerLabelContainer}>
        <Text style={styles.timerLabel}>Temps restant</Text>
      </View>

      <View style={styles.timerCircleContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg 
            width={circleSize} 
            height={circleSize} 
            viewBox={`0 0 ${circleSize} ${circleSize}`}
          >
            <G rotation="-90" origin={`${circleSize / 2}, ${circleSize / 2}`}>
              <Circle
                stroke="#E0E0E0"
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              
              <AnimatedCircle
                stroke={color}
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
          <Animated.Text style={[styles.timerText, { color: textColor }]}>
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
    marginVertical: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerLabelContainer: {
    marginBottom: spacing.xs,
  },
  timerLabel: {
    fontSize: typography.body2,
    color: '#666',
    fontWeight: typography.fontWeightMedium,
  },
  timerCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
  },
  timerPercentage: {
    fontSize: typography.caption,
    color: '#888',
    marginTop: 2,
  },
});

export default React.memo(Timer);