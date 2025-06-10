// components/CustomHeader.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderProps } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/AntDesign';
import Svg, { Path } from 'react-native-svg';

import { getThemeForScreen, spacing, typography } from './themes';

const { width: screenWidth } = Dimensions.get('window');

const CONCAVE_HEIGHT = 25;
const TRANSPARENT_SPACE = 12;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 75 : (StatusBar.currentHeight || 0) + 45;
const STATUS_BAR_PADDING = Platform.OS === 'ios' ? 25 : StatusBar.currentHeight || 0;

interface ConcaveBottomProps {
  color: string;
}

const ConcaveBottom: React.FC<ConcaveBottomProps> = React.memo(({ color }) => {
  const extraWidth = 20;
  const totalWidth = screenWidth + (extraWidth * 2);
  
  return (
    <View style={[styles.concaveContainer, { left: -extraWidth }]}>
      <Svg 
        height={CONCAVE_HEIGHT} 
        width={totalWidth} 
        viewBox={`0 0 ${totalWidth} ${CONCAVE_HEIGHT}`} 
        style={{ backgroundColor: 'transparent' }}
      >
        <Path
          d={`M0,0 L${totalWidth},0 L${totalWidth},${CONCAVE_HEIGHT/3} Q${totalWidth/2},${CONCAVE_HEIGHT*1.2} 0,${CONCAVE_HEIGHT/3} Z`}
          fill={color}
        />
      </Svg>
    </View>
  );
});

const BackButton: React.FC = React.memo(() => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.backButtonContainer}
      onPress={navigation.goBack}
      activeOpacity={0.7}
    >
      <Icon name="arrowleft" size={22} color="#fff" />
    </TouchableOpacity>
  );
});

const TransparentSpace: React.FC = React.memo(() => (
  <View style={styles.transparentSpace} pointerEvents="none" />
));

const getScreenTitle = (routeName: string): string => {
  const titles: Record<string, string> = {
    ExamenScreen: "Mode Examen",
    TrainingScreen: "Mode Entraînement",
    HistoricScreenTraining: "Historique d'Entraînement",
    TrainingSession: "Session d'Entraînement",
    ExamenSession: "Session d'Examen",
    ExamenSessionNote: "Résultat d'Examen"
  };
  
  return titles[routeName] || routeName;
};

const CustomHeader: React.FC<StackHeaderProps> = ({ route, back }) => {
  const theme = useMemo(() => getThemeForScreen(route.name), [route.name]);
  const title = useMemo(() => getScreenTitle(route.name), [route.name]);
  
  if (route.name === "HomeScreen") {
    return null;
  }

  return (
    <>
      <View style={[styles.headerOuterContainer, { height: HEADER_HEIGHT }]}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={theme.primary} 
          translucent={true}
        />
        
        <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />
        
        <View style={[styles.headerContainer, { paddingTop: STATUS_BAR_PADDING }]}>
          <View style={styles.headerContentWrapper}>
            <View style={styles.headerContent}>
              {back ? (
                <BackButton />
              ) : (
                <View style={styles.placeholderButton} />
              )}
              
              <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
              
              <View style={styles.placeholderButton} />
            </View>
          </View>
        </View>
        
        <ConcaveBottom color={theme.primary} />
      </View>
      
      <TransparentSpace />
    </>
  );
};

const styles = StyleSheet.create({
  headerOuterContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: -10,
    right: -10,
    bottom: 0,
    width: screenWidth + 20,
  },
  headerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  headerContentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    height: 40,
    transform: [{ translateY: 5 }],
  },
  headerTitle: {
    fontSize: typography.heading3,
    fontWeight: typography.fontWeightBold,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: spacing.s,
  },
  backButtonContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 34,
  },
  concaveContainer: {
    position: 'absolute',
    bottom: -CONCAVE_HEIGHT + 1,
    right: -10,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  transparentSpace: {
    height: TRANSPARENT_SPACE,
    backgroundColor: 'transparent',
    width: '100%',
  },
});

export default CustomHeader;