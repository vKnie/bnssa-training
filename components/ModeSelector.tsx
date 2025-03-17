import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ModeSelectorProps {
  mode: string;
  setMode: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.modeButton, mode === 'examen' && styles.selectedMode]} onPress={() => setMode('examen')}>
        <Text style={styles.buttonText}>Mode Examen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modeButton, mode === 'entrainement' && styles.selectedMode]} onPress={() => setMode('entrainement')}>
        <Text style={styles.buttonText}>Mode Entraînement</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  modeButton: { padding: 10, marginHorizontal: 10, backgroundColor: '#ddd', borderRadius: 5 },
  selectedMode: { backgroundColor: '#3099EF' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default ModeSelector;
