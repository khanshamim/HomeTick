/**
 * SplashScreen — shown for 2.5 s on cold launch.
 *
 * Animations:
 *   • Whole panel fades in over 600 ms
 *   • Logo box gently scales up then down on loop ("bounce-gentle")
 *   • Three dots pulse in sequence with 150 ms stagger
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

// ── Dot — individual pulsing indicator ────────────────────────────────────────
function PulseDot({ delay }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

// ── SplashScreen ──────────────────────────────────────────────────────────────
export default function SplashScreen() {
  // Fade-in for the whole panel
  const panelOpacity = useRef(new Animated.Value(0)).current;

  // Gentle scale bounce for the logo box
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Fade the panel in
    Animated.timing(panelOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 2. Gentle continuous scale pulse on the logo
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.panel, { opacity: panelOpacity }]}>

        {/* Logo box */}
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }] }]}>
          <Ionicons name="home" size={48} color={colors.primaryForeground} />
        </Animated.View>

        {/* Title + tagline */}
        <View style={styles.textGroup}>
          <Text style={styles.appName}>HomeTick</Text>
          <Text style={styles.tagline}>Family tasks, simplified</Text>
        </View>

        {/* Pulsing dot indicators */}
        <View style={styles.dots}>
          <PulseDot delay={0} />
          <PulseDot delay={150} />
          <PulseDot delay={300} />
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // gradient-to-b from background (#fff) to muted (#ececf0)
  // approximated with the midpoint colour
  screen: {
    flex: 1,
    backgroundColor: '#f4f4f7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  panel: {
    alignItems: 'center',
    gap: spacing.xl,
  },

  // w-24 h-24 rounded-3xl bg-primary shadow-lg
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 24,              // rounded-3xl ≈ 24px
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },

  textGroup: { alignItems: 'center', gap: spacing.xs },

  // text-5xl
  appName: {
    fontSize: 48,
    fontWeight: '500',
    color: colors.text,
    letterSpacing: -1,
  },

  // text-muted-foreground
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.mutedForeground,
  },

  // dot row
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
