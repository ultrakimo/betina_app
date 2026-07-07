import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import ChatBubble from '../../src/components/ChatBubble';
import GlowButton from '../../src/components/GlowButton';
import ScreenBg from '../../src/components/ScreenBg';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const CODE_LENGTH = 6;

export default function Otp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(24);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const verify = async () => {
    if (code.length < CODE_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://intelligence.geniusbet.com/api/sms/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone ?? '', otp: code }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || data.error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(`That code didn't match — try again? 🔐`);
        return;
      }
      // Set session in Supabase client
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (e) {
      setLoading(false);
      setError(`Network error — please try again.`);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    setResendIn(24);
    await fetch('https://intelligence.geniusbet.com/api/sms/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone ?? '' }),
    });
  };

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? '');
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <ScreenBg glowTop={0.2} glowSize={420}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
        >
          <View style={styles.topBar}>
            <BackButton />
          </View>

          <Animated.View entering={FadeInDown.duration(600)} style={styles.headerBlock}>
            <Text style={styles.title}>Enter the code</Text>
            <Text style={styles.subtitle}>
              We sent a {CODE_LENGTH}-digit code to <Text style={styles.phone}>{phone}</Text>
            </Text>
          </Animated.View>

          {/* OTP boxes over a hidden input */}
          <Pressable onPress={() => inputRef.current?.focus()}>
            <Animated.View entering={FadeInDown.delay(120).duration(600)} style={styles.otpRow}>
              {digits.map((d, i) => (
                <View
                  key={i}
                  style={[styles.otpBox, i === activeIndex && code.length < CODE_LENGTH && styles.otpBoxActive]}
                >
                  {d ? (
                    <Text style={styles.otpDigit}>{d}</Text>
                  ) : (
                    i === code.length && <View style={styles.cursor} />
                  )}
                </View>
              ))}
            </Animated.View>
          </Pressable>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(t) => {
              setError(null);
              setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH));
            }}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            style={styles.hiddenInput}
            autoFocus
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't get it?</Text>
            {resendIn > 0 ? (
              <Text style={styles.resendWait}>
                Resend in <Text style={styles.resendTime}>0:{String(resendIn).padStart(2, '0')}</Text>
              </Text>
            ) : (
              <Pressable onPress={resend} hitSlop={8}>
                <Text style={styles.resendTime}>Resend now</Text>
              </Pressable>
            )}
          </View>

          <GlowButton
            label="Verify"
            onPress={verify}
            loading={loading}
            disabled={code.length < CODE_LENGTH}
            style={styles.cta}
          />

          <View style={styles.flex} />

          <View style={styles.hintRow}>
            <ChatBubble role="assistant">Almost there — one code and we're in. 🔐</ChatBubble>
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
  topBar: {
    paddingVertical: Spacing.lg,
  },
  headerBlock: {
    gap: Spacing.sm,
    paddingBottom: 34,
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
    lineHeight: 21,
  },
  phone: {
    color: '#FFFFFF',
    fontFamily: Fonts.semibold,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  otpBox: {
    width: 62,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
  },
  otpBoxActive: {
    borderColor: 'rgba(191,255,0,0.55)',
  },
  otpDigit: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: Fonts.bold,
  },
  cursor: {
    width: 2,
    height: 26,
    borderRadius: 1,
    backgroundColor: Colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    paddingTop: Spacing.base,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.xl,
  },
  resendHint: {
    color: '#55556A',
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
  resendWait: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
  resendTime: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontFamily: Fonts.semibold,
  },
  cta: {
    marginTop: 32,
  },
  hintRow: {
    alignItems: 'flex-start',
  },
});
