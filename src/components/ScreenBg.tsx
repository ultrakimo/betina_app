import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming,
} from 'react-native-reanimated';
import { Colors } from '../theme';

type Props = ViewProps & {
  /** Vertical position of the primary radial glow, 0..1 of screen height */
  glowTop?: number;
  glowColor?: 'purple' | 'gold' | 'green';
  glowSize?: number;
  /** Pulsing ambient orbs behind the content (landing-page vibe). */
  orbs?: boolean;
};

const GLOWS = {
  purple: ['rgba(139,92,246,0.40)', 'rgba(139,92,246,0.12)', 'rgba(10,10,15,0)'],
  gold: ['rgba(255,215,0,0.28)', 'rgba(139,92,246,0.25)', 'rgba(10,10,15,0)'],
  green: ['rgba(184,233,38,0.22)', 'rgba(139,92,246,0.28)', 'rgba(10,10,15,0)'],
} as const;

/** A soft, slowly-pulsing ambient orb (fakes a radial glow with a clipped gradient). */
function Orb({
  color, size, top, left, right, duration, delay,
}: {
  color: string; size: number; top: number; left?: number; right?: number; duration: number; delay: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [p, duration, delay]);
  const style = useAnimatedStyle(() => ({ opacity: 0.5 + p.value * 0.5 }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, top, left, right, overflow: 'hidden' },
        style,
      ]}
    >
      <LinearGradient
        colors={[color, 'rgba(13,11,17,0)']}
        locations={[0, 0.72]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
    </Animated.View>
  );
}

/**
 * Near-black, purple-tinted screen background with the soft radial glow +
 * pulsing ambient orbs every BETina screen carries (matches the landing page).
 */
export default function ScreenBg({
  glowTop = 0.14,
  glowColor = 'purple',
  glowSize = 460,
  orbs = true,
  style,
  children,
  ...rest
}: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {orbs && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Orb color="rgba(139,92,246,0.22)" size={520} top={-160} left={-150} duration={7000} delay={0} />
          <Orb color="rgba(184,233,38,0.10)" size={560} top={260} right={-200} duration={9000} delay={800} />
        </View>
      )}

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
