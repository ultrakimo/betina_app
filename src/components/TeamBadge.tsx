import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../theme';

type Props = {
  short: string;
  size?: number;
};

/** Circular team crest placeholder (FCB blaugrana split, RMA white, generic dark). */
export default function TeamBadge({ short, size = 40 }: Props) {
  const fontSize = size * 0.28;

  if (short === 'FCB') {
    return (
      <LinearGradient
        colors={['#A50044', '#A50044', '#004D98', '#004D98']}
        locations={[0, 0.5, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.label, { fontSize, color: '#FFD700' }]}>FCB</Text>
      </LinearGradient>
    );
  }
  if (short === 'RMA') {
    return (
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFFFFF' },
        ]}
      >
        <Text style={[styles.label, { fontSize, color: '#4B4B8F' }]}>RMA</Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        },
      ]}
    >
      <Text style={[styles.label, { fontSize, color: '#9999AA' }]}>{short}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.bold,
  },
});
