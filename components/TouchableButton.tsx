// components/TouchableButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableButtonProps } from '../types';
import { typography, spacing, borderRadius } from './themes';

// === COMPOSANT BOUTON RÉUTILISABLE ===

/**
 * Composant bouton personnalisé réutilisable avec support d'icônes et états
 * Fournit une interface cohérente pour tous les boutons de l'application
 * Features : icônes optionnelles, états désactivés, styles adaptatifs, ombres multiplateformes
 */
const TouchableButton: React.FC<TouchableButtonProps> = React.memo(({
  title,                                   // Texte affiché sur le bouton
  onPress,                                 // Fonction appelée lors du clic
  backgroundColor,                         // Couleur de fond du bouton
  textColor,                               // Couleur du texte et de l'icône
  width = '100%',                          // Largeur du bouton (défaut: pleine largeur)
  iconName,                                // Nom de l'icône Material Icons (optionnel)
  borderColor = 'transparent',             // Couleur de bordure (défaut: transparente)
  borderWidth = 0,                         // Épaisseur de bordure (défaut: aucune)
  disabled = false,                        // État désactivé (défaut: activé)
  fontWeight = typography.fontWeightBold,  // Poids de police (défaut: gras)
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,                 // Application de la couleur de fond
          width: width as any,             // Largeur dynamique (string ou number)
          borderColor,                     // Couleur de bordure personnalisée
          borderWidth,                     // Épaisseur de bordure personnalisée
          opacity: disabled ? 0.6 : 1,     // Réduction d'opacité si désactivé (feedback visuel)
        },
      ]}
      onPress={disabled ? undefined : onPress}  // Désactivation du onPress si disabled
      activeOpacity={0.7}                       // Effet de transparence au toucher
      disabled={disabled}                       // Propriété native de désactivation
    >
      {/* Conteneur pour l'alignement horizontal de l'icône et du texte */}
      <View style={styles.buttonContent}>
        {/* Icône optionnelle affichée avant le texte */}
        {iconName && (
          <Icon
            name={iconName}                // Nom de l'icône Material Icons
            size={24}                      // Taille standardisée des icônes
            color={textColor}              // Couleur cohérente avec le texte
            style={styles.buttonIcon}     // Marge droite pour espacement
          />
        )}
        {/* Texte principal du bouton */}
        <Text style={[styles.buttonText, { color: textColor, fontWeight }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  // Style principal du bouton avec ombres multiplateformes
  button: {
    borderRadius: borderRadius.medium,     // Arrondis moyens pour harmonie visuelle
    paddingVertical: spacing.m,            // Padding vertical pour hauteur confortable
    paddingHorizontal: spacing.l,          // Padding horizontal pour espace latéral
    alignItems: 'center',                  // Centrage vertical du contenu
    justifyContent: 'center',              // Centrage horizontal du contenu
    // Ombres adaptées selon la plateforme
    ...Platform.select({
      ios: {
        // Ombre iOS avec shadowColor, shadowOffset, etc.
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },  // Décalage vertical pour profondeur
        shadowOpacity: 0.1,                     // Opacité subtile
        shadowRadius: 4,                        // Flou pour effet naturel
      },
      android: {
        // Équivalent Material Design avec elevation
        elevation: 4,                           // Élévation moyenne pour boutons standards
      },
      default: {},                              // Fallback pour autres plateformes
    }),
  },
  // Conteneur interne pour l'alignement icône + texte
  buttonContent: {
    flexDirection: 'row',                  // Disposition horizontale
    alignItems: 'center',                  // Alignement vertical centré
    justifyContent: 'center',              // Alignement horizontal centré
  },
  // Style du texte du bouton
  buttonText: {
    fontSize: typography.button,           // Taille de police standardisée pour boutons
    textAlign: 'center',                   // Centrage du texte
  },
  // Style de l'icône avec espacement
  buttonIcon: {
    marginRight: spacing.s,                // Marge droite pour séparer l'icône du texte
  },
});

// Nom d'affichage pour le debugging et les outils de développement
TouchableButton.displayName = 'TouchableButton';

export default TouchableButton;