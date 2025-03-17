import React, { useMemo } from 'react';
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
  disabled = false,
  borderColor = 'transparent',
  borderWidth = 0,
}) => {
  const buttonStyles = useMemo(() => [
    styles.button,
    { backgroundColor, width: width as DimensionValue, borderColor, borderWidth },
    disabled && styles.disabledButton,
  ], [backgroundColor, width, borderColor, borderWidth, disabled]);

  const textStyles = useMemo(() => [
    styles.buttonText,
    { color: textColor },
  ], [textColor]);

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      style={buttonStyles}
      disabled={disabled}
    >
      <View style={styles.buttonContent}>
        {iconName && <Icon name={iconName} size={24} color={textColor} style={styles.icon} />}
        <Text style={textStyles}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { padding: 10, borderRadius: 8, alignItems: 'center', borderStyle: 'solid', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  disabledButton: { opacity: 0.5, },
  buttonContent: { flexDirection: 'row', alignItems: 'center', },
  buttonText: { fontSize: 16, },
  icon: { marginRight: 8, },
});

export default Button;