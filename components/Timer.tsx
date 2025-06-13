// components/Timer.tsx
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';

import { typography, spacing, getThemeForScreen } from './themes';

// === INTERFACES ===

interface TimerProps {
  timeLeft: number;                        // Temps restant en secondes
  totalTime: number;                       // Temps total initial en secondes
}

// Création d'un composant Circle animé pour la progression circulaire
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// === COMPOSANT PRINCIPAL ===

/**
 * Composant Timer avec affichage circulaire animé et alertes visuelles
 * Affiche le temps restant avec progression circulaire et changements de couleur selon les seuils
 */
const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const route = useRoute();
  // Mémoisation du thème pour éviter les recalculs
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  
  // Références pour les animations (persistantes entre re-renders)
  const animatedValue = useRef(new Animated.Value(timeLeft / totalTime)).current; // Animation du cercle de progression
  const pulseAnim = useRef(new Animated.Value(1)).current;                        // Animation de pulsation d'alerte

  // === FONCTIONS UTILITAIRES ===

  /**
   * Formate le temps en format MM:SS pour l'affichage
   * @param seconds - Nombre de secondes à formater
   * @returns String formaté "MM:SS"
   */
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Ajoute un zéro devant les secondes si < 10 pour maintenir le format MM:SS
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  // === LOGIQUE D'ALERTE VISUELLE ===

  /**
   * Détermine la couleur et le comportement selon le temps restant
   * Système d'alerte à seuils : critique (≤60s), avertissement (≤300s), normal
   */
  const { color, textColor, shouldPulse } = useMemo(() => {
    if (timeLeft <= 60) {
      // État critique : dernière minute (rouge + pulsation rapide)
      return {
        color: theme.error,                // Rouge pour urgence
        textColor: theme.error,
        shouldPulse: true,                 // Pulsation d'alerte
      };
    } else if (timeLeft <= 300) {
      // État d'avertissement : 5 dernières minutes (orange + pulsation lente)
      return {
        color: theme.warning || '#FFA000', // Orange avec fallback
        textColor: theme.warning || '#FFA000',
        shouldPulse: true,                 // Pulsation d'avertissement
      };
    }
    // État normal : plus de 5 minutes (couleur principale, pas de pulsation)
    return {
      color: theme.primary,                // Couleur du thème
      textColor: theme.text,               // Texte standard
      shouldPulse: false,                  // Pas d'animation
    };
  }, [timeLeft, theme]);

  // Calcul du pourcentage de temps restant pour affichage
  const percentageLeft = useMemo(() => 
    Math.round((timeLeft / totalTime) * 100), 
    [timeLeft, totalTime]
  );

  // === ANIMATIONS ===

  /**
   * Animation du cercle de progression
   * Se met à jour à chaque changement de temps pour refléter la progression
   */
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: timeLeft / totalTime,       // Valeur cible basée sur le ratio temps restant/total
      duration: 1000,                      // Animation d'1 seconde pour fluidité
      useNativeDriver: false,              // Nécessaire pour strokeDashoffset (pas supporté par native driver)
    }).start();
  }, [timeLeft, totalTime, animatedValue]);

  /**
   * Animation de pulsation pour les alertes visuelles
   * Vitesse et amplitude variables selon l'urgence
   */
  useEffect(() => {
    if (shouldPulse) {
      // Paramètres d'animation selon l'urgence
      const duration = timeLeft <= 60 ? 500 : 800;      // Pulsation plus rapide si critique
      const scale = timeLeft <= 60 ? 1.2 : 1.1;         // Amplitude plus forte si critique
      
      // Animation en boucle : agrandissement puis retour à la taille normale
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: scale,                // Agrandissement
            duration,
            useNativeDriver: true,         // Optimisation native pour les transformations
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,                    // Retour à la taille normale
            duration,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
      
      // Nettoyage : arrêt de l'animation lors du démontage ou changement d'état
      return () => pulseAnimation.stop();
    } else {
      // Réinitialisation de la scale si pas de pulsation
      pulseAnim.setValue(1);
    }
  }, [shouldPulse, timeLeft, pulseAnim]);

  // === CALCULS GÉOMÉTRIQUES POUR LE CERCLE SVG ===

  const circleSize = 80;                                 // Taille du conteneur SVG
  const strokeWidth = 8;                                 // Épaisseur du trait du cercle
  const radius = (circleSize - strokeWidth) / 2;        // Rayon ajusté pour centrage parfait
  const circumference = 2 * Math.PI * radius;           // Circonférence pour calcul du dasharray

  /**
   * Interpolation pour l'animation du cercle de progression
   * Transforme la valeur animée (0-1) en offset pour le dasharray SVG
   */
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],                    // Valeur d'entrée normalisée
    outputRange: [circumference, 0],       // Offset : cercle vide → cercle complet
  });

  return (
    <View style={styles.timerContainer}>
      {/* Label descriptif du timer */}
      <View style={styles.timerLabelContainer}>
        <Text style={styles.timerLabel}>Temps restant</Text>
      </View>

      {/* Conteneur principal du cercle de progression */}
      <View style={styles.timerCircleContainer}>
        {/* Animation de pulsation appliquée à tout le cercle */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Svg 
            width={circleSize} 
            height={circleSize} 
            viewBox={`0 0 ${circleSize} ${circleSize}`}
          >
            {/* Groupe avec rotation pour commencer la progression en haut */}
            <G rotation="-90" origin={`${circleSize / 2}, ${circleSize / 2}`}>
              {/* Cercle de fond (gris) */}
              <Circle
                stroke="#E0E0E0"           // Couleur de fond neutre
                fill="none"                // Pas de remplissage
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeLinecap="round"      // Extrémités arrondies
              />
              
              {/* Cercle de progression animé */}
              <AnimatedCircle
                stroke={color}             // Couleur selon l'état (normal/avertissement/critique)
                fill="none"
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}     // Définit la longueur totale du trait
                strokeDashoffset={strokeDashoffset} // Animated: contrôle la partie visible
                strokeLinecap="round"
              />
            </G>
          </Svg>
        </Animated.View>

        {/* Texte centré dans le cercle */}
        <View style={styles.timerTextContainer}>
          {/* Temps formaté avec couleur dynamique */}
          <Animated.Text style={[styles.timerText, { color: textColor }]}>
            {formatTime(timeLeft)}
          </Animated.Text>
          {/* Pourcentage en texte plus petit */}
          <Text style={styles.timerPercentage}>{percentageLeft}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal centré
  timerContainer: {
    marginVertical: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Conteneur du label
  timerLabelContainer: {
    marginBottom: spacing.xs,
  },
  // Style du label descriptif
  timerLabel: {
    fontSize: typography.body2,
    color: '#666',
    fontWeight: typography.fontWeightMedium,
  },
  // Conteneur du cercle avec ombre multiplateforme
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
        elevation: 2,                      // Équivalent Material Design de l'ombre iOS
      },
      default: {},
    }),
  },
  // Conteneur du texte centré dans le cercle
  timerTextContainer: {
    position: 'absolute',               // Positionnement au centre du cercle SVG
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Style du temps principal affiché
  timerText: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
  },
  // Style du pourcentage secondaire
  timerPercentage: {
    fontSize: typography.caption,
    color: '#888',
    marginTop: 2,
  },
});

// Mémoisation du composant pour éviter les re-renders inutiles
export default React.memo(Timer);