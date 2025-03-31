import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type HistoricScreenTrainingNavigationProp = StackNavigationProp<RootStackParamList, 'HistoricScreenTraining'>;

const HistoricScreenTraining: React.FC = () => {
    const navigation = useNavigation<HistoricScreenTrainingNavigationProp>();

    return (
        <View style={styles.screenContainer}>
            <Text>Historique des examens</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'space-between' },
});

export default HistoricScreenTraining;
