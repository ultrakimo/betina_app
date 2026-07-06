import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import ChatBubble from '../../src/components/ChatBubble';
import GlowButton from '../../src/components/GlowButton';
import ScreenBg from '../../src/components/ScreenBg';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const country = { flag: '🇦🇹', name: 'Austria' };

  const continueSetup = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ name: name.trim(), country: country.name })
        .eq('id', data.user.id);
    }
    router.push({ pathname: '/(auth)/interests', params: { name: name.trim() } });
  };

  return (
    <ScreenBg glowTop={0.14} glowSize={420}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* back + step progress */}
          <View style={styles.topBar}>
            <BackButton />
            <View style={styles.progress}>
              <View style={[styles.progressSeg, styles.progressActive]} />
              <View style={styles.progressSeg} />
            </View>
          </View>

          <Animated.View entering={FadeInDown.duration(600)} style={styles.headerBlock}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Just the essentials — BETina handles the rest.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(600)} style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Country</Text>
              <Pressable style={styles.selectRow}>
                <View style={styles.selectLeft}>
                  <Text style={styles.flag}>{country.flag}</Text>
                  <Text style={styles.selectValue}>{country.name}</Text>
                </View>
                <Text style={styles.caret}>▾</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#55556A"
                  style={styles.input}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Birthday</Text>
              <View style={styles.birthdayRow}>
                <View style={[styles.birthdayBox, { flex: 1 }]}>
                  <TextInput
                    value={day}
                    onChangeText={setDay}
                    placeholder="14"
                    placeholderTextColor="#55556A"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.birthdayInput}
                  />
                </View>
                <View style={[styles.birthdayBox, { flex: 1.4 }]}>
                  <TextInput
                    value={month}
                    onChangeText={setMonth}
                    placeholder="March"
                    placeholderTextColor="#55556A"
                    style={styles.birthdayInput}
                  />
                </View>
                <View style={[styles.birthdayBox, { flex: 1.2 }]}>
                  <TextInput
                    value={year}
                    onChangeText={setYear}
                    placeholder="1994"
                    placeholderTextColor="#55556A"
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.birthdayInput}
                  />
                </View>
              </View>
              <Text style={styles.ageHint}>You must be 18+ to use BETina.</Text>
            </View>
          </Animated.View>

          <View style={styles.spacer} />

          {name.trim().length > 0 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.hintRow}>
              <ChatBubble role="assistant">
                <Text style={styles.hintText}>
                  Nice to meet you, {name.trim()}! Your journey starts at{' '}
                  <Text style={styles.hintAccent}>INITIATE</Text>.
                </Text>
              </ChatBubble>
            </Animated.View>
          )}

          <GlowButton label="Continue" onPress={continueSetup} disabled={!name.trim()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSeg: {
    width: 22,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressActive: {
    backgroundColor: Colors.primary,
  },
  headerBlock: {
    gap: Spacing.sm,
    paddingBottom: 30,
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
  form: {
    gap: Spacing.lg,
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
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  flag: { fontSize: 20 },
  selectValue: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
    fontFamily: Fonts.semibold,
  },
  caret: { color: '#55556A', fontSize: 12 },
  inputWrap: {
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
  birthdayRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  birthdayBox: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
  },
  birthdayInput: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
    fontFamily: Fonts.semibold,
    paddingVertical: 16,
    textAlign: 'center',
  },
  ageHint: {
    color: '#55556A',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  spacer: { flex: 1, minHeight: Spacing.xl },
  hintRow: {
    paddingBottom: 18,
  },
  hintText: {
    color: '#E8E8F0',
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
    lineHeight: 20,
  },
  hintAccent: {
    color: Colors.primary,
    fontFamily: Fonts.semibold,
  },
});
