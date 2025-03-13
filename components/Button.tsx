import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  width?: number;
  iconName?: string; // Nouveau prop pour l'icône
}

const Button: React.FC<ButtonProps> = ({ title, onPress, backgroundColor, textColor, width, iconName }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor, width }]}>
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
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 8, // Espacement entre l'icône et le texte
  },
});

export default Button;
