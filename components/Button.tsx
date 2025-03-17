import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, DimensionValue } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: string | number;
  iconName?: string;
  disabled?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  backgroundColor,
  textColor,
  width,
  iconName,
  borderColor = 'transparent',
  borderWidth = 0,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor, width: width as DimensionValue, borderColor, borderWidth },
      ]}
    >
      <View style={styles.buttonContent}>
        {iconName && <Icon name={iconName} size={24} color={textColor} style={styles.icon} />}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'solid',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 8, // Espacement entre l'icône et le texte
  },
});

export default Button;
