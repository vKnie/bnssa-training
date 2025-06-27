// components/TouchableButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableButtonProps } from '../types';
import { typography, spacing, borderRadius } from './themes';

const TouchableButton: React.FC<TouchableButtonProps> = React.memo(({
  title,
  onPress,
  backgroundColor,
  textColor,
  width = '100%',
  iconName,
  borderColor = 'transparent',
  borderWidth = 0,
  disabled = false,
  fontWeight = typography.fontWeightBold,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          width: width as any,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.buttonContent}>
        {iconName && (
          <Icon
            name={iconName}
            size={24}
            color={textColor}
            style={styles.buttonIcon}
          />
        )}
        <Text style={[styles.buttonText, { color: textColor, fontWeight }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
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
      default: {},
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.button,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: spacing.s,
  },
});

TouchableButton.displayName = 'TouchableButton';

export default TouchableButton;