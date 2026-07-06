import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { Fonts, Typography } from '../theme';

/** Tiny letter-spaced uppercase section header ("FREQUENT QUESTIONS", "TODAY", …). */
export default function SectionLabel({ style, children, ...rest }: TextProps) {
  return (
    <Text style={[styles.label, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
});
