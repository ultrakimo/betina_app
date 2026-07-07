import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlowButton from '../../src/components/GlowButton';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import SectionLabel from '../../src/components/SectionLabel';
import Toggle from '../../src/components/Toggle';
import { useProfile } from '../../src/hooks/useProfile';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const RESPONSIBLE_GAMING_URL = 'https://www.begambleaware.org';

function Row({
  emoji,
  label,
  value,
  onPress,
  right,
  last,
}: {
  emoji: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {right ?? (onPress && <Text style={styles.rowChevron}>›</Text>)}
      </Pressable>
      {!last && <View style={styles.divider} />}
    </>
  );
}

export default function Settings() {
  const { profile, phone } = useProfile();
  const name = profile?.name ?? '...';
  const tier = profile?.vip_tier ?? 'INITIATE';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [eventReminders, setEventReminders] = useState(true);
  const [betinaMessages, setBetinaMessages] = useState(true);
  const [tierUpdates, setTierUpdates] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenBg glowTop={0.12} glowSize={440}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>Settings</Text>
        </Animated.View>

        {/* profile card */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <GlowCard style={styles.profileCard}>
            <View style={styles.profileInitial}>
              <Text style={styles.profileInitialLabel}>{name[0]}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileMeta}>
                {phone ?? '—'} · {tier}
              </Text>
            </View>
            <Text style={styles.rowChevron}>›</Text>
          </GlowCard>
        </Animated.View>

        {/* general */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.section}>
          <SectionLabel>GENERAL</SectionLabel>
          <GlowCard>
            <Row emoji="🌐" label="Language" value="English" onPress={() => router.push('/language')} />
            <Row emoji="🎨" label="Appearance" value="Dark" onPress={() => {}} last />
          </GlowCard>
        </Animated.View>

        {/* notifications */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <SectionLabel>PUSH NOTIFICATIONS</SectionLabel>
          <GlowCard>
            <Row
              emoji="⚽"
              label="Event reminders"
              right={<Toggle value={eventReminders} onValueChange={setEventReminders} />}
            />
            <Row
              emoji="💬"
              label="Messages from BETina"
              right={<Toggle value={betinaMessages} onValueChange={setBetinaMessages} />}
            />
            <Row
              emoji="🏆"
              label="Tier & XP updates"
              right={<Toggle value={tierUpdates} onValueChange={setTierUpdates} />}
              last
            />
          </GlowCard>
          <Pressable onPress={() => router.push('/notification-prefs')} style={styles.moreLink}>
            <Text style={styles.moreLinkLabel}>All notification settings ›</Text>
          </Pressable>
        </Animated.View>

        {/* support */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} style={styles.section}>
          <SectionLabel>SUPPORT</SectionLabel>
          <GlowCard>
            <Row emoji="💡" label="Help & support" onPress={() => router.push('/help')} />
            <Row
              emoji="🛡️"
              label="Responsible gaming"
              right={<Text style={styles.externalHint}>opens browser ↗</Text>}
              onPress={() => WebBrowser.openBrowserAsync(RESPONSIBLE_GAMING_URL)}
            />
            <Row emoji="📄" label="Terms & Privacy" onPress={() => {}} last />
          </GlowCard>
        </Animated.View>

        {/* logout */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.section}>
          <GlowButton label="Log out" variant="danger" onPress={logout} />
          <Text style={styles.version}>BETina v1.0 · powered by GeniusBet</Text>
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileInitial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(191,255,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(191,255,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialLabel: {
    color: Colors.primary,
    fontSize: Typography.md + 1,
    fontFamily: Fonts.bold,
  },
  profileInfo: {
    flex: 1,
    gap: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: Typography.base + 1,
    fontFamily: Fonts.bold,
  },
  profileMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  section: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowEmoji: { fontSize: 17 },
  rowLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.semibold,
  },
  rowValue: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
  rowChevron: {
    color: '#55556A',
    fontSize: Typography.sm + 1,
  },
  externalHint: {
    color: '#55556A',
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 16,
  },
  moreLink: {
    alignSelf: 'flex-end',
  },
  moreLinkLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
  version: {
    textAlign: 'center',
    color: '#3A3A4A',
    fontSize: Typography.xs,
    fontFamily: Fonts.medium,
    paddingTop: Spacing.xs,
  },
});
