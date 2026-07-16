import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';

type Props = ViewProps & {
  /** Vertical position of the purple radial glow, 0..1 of screen height */
  glowTop?: number;
  glowColor?: 'purple' | 'gold' | 'green';
  glowSize?: number;
};

const GLOWS = {
  purple: ['rgba(139,92,246,0.40)', 'rgba(139,92,246,0.12)', 'rgba(10,10,15,0)'],
  gold: ['rgba(255,215,0,0.28)', 'rgba(139,92,246,0.25)', 'rgba(10,10,15,0)'],
  green: ['rgba(184,233,38,0.22)', 'rgba(139,92,246,0.28)', 'rgba(10,10,15,0)'],
} as const;

/**
 * Near-black screen background with the soft radial glow every BETina
 * screen carries. Approximates the design's radial-gradient with a
 * large circular LinearGradient blob.
 */
export default function ScreenBg({
  glowTop = 0.14,
  glowColor = 'purple',
  glowSize = 460,
  style,
  children,
  ...rest
}: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <View
        pointerEvents="none"
        style={[
          styles.glowWrap,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            top: `${glowTop * 100}%`,
            marginTop: -glowSize / 2,
            marginLeft: -glowSize / 2,
          },
        ]}
      >
        <LinearGradient
          colors={[...GLOWS[glowColor]] as [string, string, string]}
          locations={[0, 0.45, 0.75]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: glowSize / 2, opacity: 0.9 }]}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glowWrap: {
    position: 'absolute',
    left: '50%',
    overflow: 'hidden',
  },
});
