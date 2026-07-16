import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import BETinaAvatar from '../../src/components/BETinaAvatar';
import ChatBubble from '../../src/components/ChatBubble';
import GlowButton from '../../src/components/GlowButton';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import TeamBadge from '../../src/components/TeamBadge';
import { demoEvents } from '../../src/lib/demo';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const FORM = {
  home: ['W', 'W', 'D', 'W', 'W'],
  away: ['W', 'L', 'W', 'D', 'W'],
};

function FormChip({ result }: { result: string }) {
  const win = result === 'W';
  const loss = result === 'L';
  return (
    <View
      style={[
        styles.formChip,
        win && styles.formChipWin,
        loss && styles.formChipLoss,
      ]}
    >
      <Text
        style={[
          styles.formChipLabel,
          win && styles.formChipLabelWin,
          loss && styles.formChipLabelLoss,
        ]}
      >
        {result}
      </Text>
    </View>
  );
}

export default function EventDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = demoEvents.find((e) => e.id === id) ?? demoEvents[0];

  return (
    <ScreenBg glowTop={0.18} glowSize={480}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* top bar */}
        <View style={styles.topBar}>
          <BackButton />
          <Text style={styles.topLabel}>
            {event.leagueEmoji} {event.league.includes('LIGA') ? 'LA LIGA · MATCHDAY 12' : event.league}
          </Text>
          <Pressable style={styles.bell}>
            <Text style={styles.bellEmoji}>🔔</Text>
          </Pressable>
        </View>

        {/* match hero */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlowCard variant="purple" style={styles.hero}>
            <View style={styles.heroTeams}>
              <View style={styles.heroTeam}>
                <TeamBadge short={event.homeShort} size={56} />
                <View style={styles.heroTeamText}>
                  <Text style={styles.heroTeamName}>{event.home}</Text>
                  <Text style={styles.heroTeamMeta}>1st · 31 pts</Text>
                </View>
              </View>
              <View style={styles.heroCenter}>
                <Text style={styles.heroTime}>{event.time}</Text>
                <Text style={styles.heroCountdown}>in 1 h 18 min</Text>
              </View>
              <View style={styles.heroTeam}>
                <TeamBadge short={event.awayShort} size={56} />
                <View style={styles.heroTeamText}>
                  <Text style={styles.heroTeamName}>{event.away}</Text>
                  <Text style={styles.heroTeamMeta}>2nd · 29 pts</Text>
                </View>
              </View>
            </View>
            {event.venue && (
              <Text style={styles.heroVenue}>
                📍 {event.venue} <Text style={styles.heroDot}>·</Text> {event.tagline}
              </Text>
            )}
          </GlowCard>
        </Animated.View>

        {/* form */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <GlowCard style={styles.formCard}>
            <Text style={styles.formTitle}>FORM · LAST 5</Text>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                {FORM.home.map((r, i) => (
                  <FormChip key={`h${i}`} result={r} />
                ))}
              </View>
              <Text style={styles.formVs}>vs</Text>
              <View style={styles.formGroup}>
                {FORM.away.map((r, i) => (
                  <FormChip key={`a${i}`} result={r} />
                ))}
              </View>
            </View>
          </GlowCard>
        </Animated.View>

        {/* BETina's take */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.takeRow}>
          <BETinaAvatar size={40} />
          <View style={styles.takeBody}>
            <Text style={styles.takeLabel}>BETINA'S TAKE</Text>
            <Pressable onPress={() => router.push('/(tabs)/chat')}>
              <ChatBubble role="assistant" showAvatar={false}>
                <Text style={styles.takeText}>
                  Barça unbeaten at home this season, and Madrid's away defense has cracked twice
                  this month. Watch Lewandowski vs Rüdiger — that duel decides it.{' '}
                  <Text style={styles.takeLink}>Discuss with me →</Text>
                </Text>
              </ChatBubble>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* actions */}
        <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.actions}>
          <GlowButton label="🔔 Remind me at kickoff" onPress={() => {}} />
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  topLabel: {
    color: Colors.primary,
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1.1,
  },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellEmoji: { fontSize: 15 },
  hero: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: Spacing.base,
  },
  heroTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTeam: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroTeamText: {
    alignItems: 'center',
    gap: 2,
  },
  heroTeamName: {
    color: '#FFFFFF',
    fontSize: Typography.base,
    fontFamily: Fonts.bold,
  },
  heroTeamMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
  },
  heroCenter: {
    alignItems: 'center',
    gap: 4,
  },
  heroTime: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  heroCountdown: {
    color: Colors.primary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.bold,
  },
  heroVenue: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  heroDot: {
    color: '#3A3A4A',
  },
  formCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: Spacing.sm + 2,
  },
  formTitle: {
    textAlign: 'center',
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1.1,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  formVs: {
    color: '#3A3A4A',
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
  },
  formChip: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formChipWin: {
    backgroundColor: 'rgba(184,233,38,0.18)',
    borderColor: 'rgba(184,233,38,0.45)',
  },
  formChipLoss: {
    backgroundColor: 'rgba(255,80,80,0.15)',
    borderColor: 'rgba(255,80,80,0.4)',
  },
  formChipLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  formChipLabelWin: {
    color: Colors.primary,
  },
  formChipLabelLoss: {
    color: '#FF7A7A',
  },
  takeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm + 2,
  },
  takeBody: {
    flex: 1,
    gap: 6,
  },
  takeLabel: {
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1.1,
  },
  takeText: {
    color: '#E8E8F0',
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
    lineHeight: 20,
  },
  takeLink: {
    color: Colors.primary,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.base,
  },
  actions: {
    gap: Spacing.sm + 2,
  },
  ctaLogo: {
    height: 16,
    width: 20,
    tintColor: Colors.background,
  },
  ctaArrow: {
    color: Colors.background,
    fontSize: Typography.md - 1,
    fontFamily: Fonts.bold,
  },
});
