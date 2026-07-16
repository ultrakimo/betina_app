import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors } from '../theme';

type Variant = 'glass' | 'purple' | 'gold' | 'green';

type Props = ViewProps & {
  variant?: Variant;
};

const GRADIENTS: Record<Exclude<Variant, 'glass'>, { colors: [string, string]; border: string }> = {
  purple: { colors: ['rgba(139,92,246,0.35)', 'rgba(255,255,255,0.04)'], border: 'rgba(139,92,246,0.5)' },
  gold: { colors: ['rgba(255,215,0,0.14)', 'rgba(255,255,255,0.04)'], border: 'rgba(255,215,0,0.4)' },
  green: { colors: ['rgba(184,233,38,0.12)', 'rgba(255,255,255,0.04)'], border: 'rgba(184,233,38,0.5)' },
};

/** Glassmorphism card — the base surface of every list row / panel in BETina. */
export default function GlowCard({ variant = 'glass', style, children, ...rest }: Props) {
  if (variant === 'glass') {
    return (
      <View style={[styles.glass, style]} {...rest}>
        {children}
      </View>
    );
  }
  const g = GRADIENTS[variant];
  return (
    <LinearGradient
      colors={g.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { borderColor: g.border }, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.xl,
  },
  gradient: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
  },
});
