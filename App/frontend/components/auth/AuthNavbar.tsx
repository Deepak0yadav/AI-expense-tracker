import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AuthNavbarProps {
  scrollY?: Animated.Value;
}

export function AuthNavbar({ scrollY }: AuthNavbarProps) {
  const navbarOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  const navbarTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -80],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: navbarOpacity,
          transform: [{ translateY: navbarTranslateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          </View>
          <Text style={styles.brandText}>FinGenius</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
});
