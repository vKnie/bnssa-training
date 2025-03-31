import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const animatedValue = new Animated.Value(timeLeft / totalTime);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: timeLeft / totalTime,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, totalTime]);

  const circleSize = 100;
  const strokeWidth = 10;
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

  return (
    <View style={styles.timerContainer}>
      <Svg width={circleSize} height={circleSize}>
        <Circle
          stroke="#007AFF"
          fill="none"
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // Initial offset
          strokeLinecap="round"
        />
        <AnimatedCircle
          stroke="#007AFF"
          fill="none"
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Animated.Text style={styles.timerText}>{formatTime(timeLeft)}</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: { marginTop: 20, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  timerText: { position: 'absolute', color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
});

export default Timer;
