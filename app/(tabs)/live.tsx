import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import SectionLabel from '../../src/components/SectionLabel';
import TeamBadge from '../../src/components/TeamBadge';
import { demoEvents, demoNews } from '../../src/lib/demo';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const LEAGUES = ['La Liga', 'Champions League', 'ATP'];

function LiveDot({ size = 8, color = '#FF5050' }: { size?: number; color?: string }) {
  const opacity = useSharedValue(0.55);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

export default function Live() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [league, setLeague] = useState('La Liga');
  const today = demoEvents.filter((e) => !e.featured);

  return (
    <ScreenBg glowTop={0.14} glowSize={460}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* header with bell */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.title}>Live & News</Text>
          <Pressable onPress={() => router.push('/notifications')} style={styles.bell}>
            <Text style={styles.bellEmoji}>🔔</Text>
            <View style={styles.bellDot} />
          </Pressable>
        </Animated.View>

        {/* league filter chips */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {LEAGUES.map((l) => {
              const active = l === league;
              return (
                <Pressable
                  key={l}
                  onPress={() => setLeague(l)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{l}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* LIVE NOW */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.section}>
          <View style={styles.liveHeader}>
            <LiveDot />
            <SectionLabel>LIVE NOW</SectionLabel>
          </View>

          <Pressable onPress={() => router.push('/event/clasico')}>
            <GlowCard variant="purple" style={styles.liveCard}>
              <View style={styles.liveTop}>
                <Text style={styles.liveLeague}>⚽ LA LIGA · EL CLÁSICO</Text>
                <View style={styles.minutePill}>
                  <LiveDot size={6} color="#FF7A7A" />
                  <Text style={styles.minuteLabel}>67'</Text>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <View style={styles.scoreTeam}>
                  <TeamBadge short="FCB" size={40} />
                  <Text style={styles.scoreTeamName}>Barcelona</Text>
                </View>
                <View style={styles.score}>
                  <Text style={styles.scoreValue}>2</Text>
                  <Text style={styles.scoreColon}>:</Text>
                  <Text style={styles.scoreValue}>1</Text>
                </View>
                <View style={styles.scoreTeam}>
                  <TeamBadge short="RMA" size={40} />
                  <Text style={styles.scoreTeamName}>Real Madrid</Text>
                </View>
              </View>
              <View style={styles.momentBox}>
                <Text style={styles.momentEmoji}>⚡</Text>
                <Text style={styles.momentText}>
                  Lewandowski scores his 2nd — BETina called it in your chat 🔥
                </Text>
              </View>
            </GlowCard>
          </Pressable>
        </Animated.View>

        {/* TODAY */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <SectionLabel>TODAY</SectionLabel>
          {today.map((event) => (
            <Pressable key={event.id} onPress={() => router.push(`/event/${event.id}`)}>
              <GlowCard style={styles.todayCard}>
                <View style={styles.todayInfo}>
                  <Text style={styles.todayLeague}>
                    {event.leagueEmoji} {event.league}
                  </Text>
                  <Text style={styles.todayName}>
                    {event.home} vs {event.away}
                  </Text>
                </View>
                <Text style={styles.todayTime}>{event.time}</Text>
              </GlowCard>
            </Pressable>
          ))}
        </Animated.View>

        {/* HEADLINES */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} style={styles.section}>
          <View style={styles.newsHeader}>
            <SectionLabel>HEADLINES</SectionLabel>
            <Pressable hitSlop={8}>
              <Text style={styles.newsMore}>More news</Text>
            </Pressable>
          </View>
          {demoNews.map((item) => (
            <GlowCard key={item.id} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsAge}>{item.age}</Text>
            </GlowCard>
          ))}
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.bold,
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
  bellEmoji: { fontSize: 16 },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  chips: {
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  chipActive: {
    backgroundColor: 'rgba(191,255,0,0.14)',
    borderColor: 'rgba(191,255,0,0.5)',
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },
  section: {
    gap: Spacing.sm + 2,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  liveCard: {
    padding: 16,
    gap: Spacing.md,
  },
  liveTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveLeague: {
    color: Colors.primary,
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  minutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,80,80,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  minuteLabel: {
    color: '#FF7A7A',
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTeam: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  scoreTeamName: {
    color: '#FFFFFF',
    fontSize: Typography.sm,
    fontFamily: Fonts.bold,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: Fonts.bold,
  },
  scoreColon: {
    color: '#55556A',
    fontSize: Typography.lg,
    fontFamily: Fonts.bold,
  },
  momentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(10,10,15,0.5)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  momentEmoji: { fontSize: 14 },
  momentText: {
    flex: 1,
    color: '#E8E8F0',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
    lineHeight: 17,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  todayInfo: { gap: 2 },
  todayLeague: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
    letterSpacing: 0.7,
  },
  todayName: {
    color: '#FFFFFF',
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.semibold,
  },
  todayTime: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsMore: {
    color: Colors.primary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  newsTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Typography.sm,
    fontFamily: Fonts.semibold,
    lineHeight: 18,
  },
  newsAge: {
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
  },
});
