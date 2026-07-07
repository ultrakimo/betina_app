import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BETinaAvatar from '../../src/components/BETinaAvatar';
import GlowButton from '../../src/components/GlowButton';
import ScreenBg from '../../src/components/ScreenBg';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialCode = '+43';

  const sendCode = async () => {
    const fullPhone = `${dialCode}${phone.replace(/\s/g, '')}`;
    if (phone.replace(/\D/g, '').length < 6) {
      setError("That number looks a bit short — mind checking it? 🤔");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://intelligence.geniusbet.com/api/sms/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || !data.success) {
        setError(`Hmm, that didn't work. Please try again.`);
        return;
      }
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } catch (e) {
      setLoading(false);
      setError(`Network error — please try again.`);
    }
  };

  return (
    <ScreenBg glowTop={0.18} glowSize={420}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
        >
          {/* BETina greets */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <BETinaAvatar size={88} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                BETina is waiting for you.{'\n'}Sign in with your phone number.
              </Text>
            </View>
          </Animated.View>

          {/* phone input */}
          <Animated.View entering={FadeInDown.delay(150).duration(700)} style={styles.field}>
            <Text style={styles.fieldLabel}>Phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.dialCode}>
                <Text style={styles.dialFlag}>🇦🇹</Text>
                <Text style={styles.dialText}>{dialCode}</Text>
                <Text style={styles.dialCaret}>▾</Text>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t);
                    setError(null);
                  }}
                  placeholder="664 123 45"
                  placeholderTextColor="#55556A"
                  keyboardType="phone-pad"
                  style={styles.input}
                  autoFocus
                />
              </View>
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(250).duration(700)} style={styles.ctaBlock}>
            <GlowButton label="Send code" onPress={sendCode} loading={loading} />
            <Text style={styles.terms}>
              By continuing you agree to the <Text style={styles.termsLink}>Terms</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>

          <View style={styles.flex} />

          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>New here?</Text>
            <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
              <Text style={styles.registerLink}>Create account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.base,
    paddingTop: 28,
    paddingBottom: 36,
  },
  headerText: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    lineHeight: 21,
  },
  field: {
    gap: Spacing.sm + 2,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  dialCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  dialFlag: { fontSize: 18 },
  dialText: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
    fontFamily: Fonts.semibold,
  },
  dialCaret: { color: '#55556A', fontSize: 11 },
  inputWrap: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(191,255,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 18,
  },
  input: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
    fontFamily: Fonts.semibold,
    paddingVertical: 16,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
    lineHeight: 19,
  },
  ctaBlock: {
    gap: 18,
    marginTop: 28,
  },
  terms: {
    color: '#55556A',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    lineHeight: 19,
  },
  termsLink: {
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  registerHint: {
    color: Colors.textSecondary,
    fontSize: Typography.base - 1,
    fontFamily: Fonts.medium,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: Typography.base - 1,
    fontFamily: Fonts.semibold,
  },
});
