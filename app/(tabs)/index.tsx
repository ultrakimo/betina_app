import React, { useEffect, useState } from 'react';
import { useI18n } from '../../src/lib/i18n';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AnimatedNumber from '../../src/components/AnimatedNumber';
import BETinaAvatar from '../../src/components/BETinaAvatar';
import GlowButton from '../../src/components/GlowButton';
import GlowCard from '../../src/components/GlowCard';
import ParticlesBg from '../../src/components/ParticlesBg';
import ScreenBg from '../../src/components/ScreenBg';
import XPBar from '../../src/components/XPBar';
import { demoEvents, tiers } from '../../src/lib/demo';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const GENIUSBET_URL = 'https://geniusbet.com';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function getTierInfo(xp: number) {
  const current = [...tiers].reverse().find((t) => xp >= t.minXp) ?? tiers[0];
  const currentIdx = tiers.findIndex((t) => t.name === current.name);
  const next = tiers[currentIdx + 1] ?? null;
  const progress = next
    ? (xp - current.minXp) / (next.minXp - current.minXp)
    : 1;
  return { current, next, progress };
}

type Profile = {
  name: string;
  vip_tier: string;
  xp_points: number;
  favourite_team: string | null;
  favourite_sport: string | null;
  country: string | null;
};

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('name, vip_tier, xp_points, favourite_team, favourite_sport, country')
        .eq('id', user.id)
        .maybeSingle();
      if (data) setProfile(data);
    } catch (e) {
      console.error('Profile load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const xp = profile?.xp_points ?? 0;
  const name = profile?.name ?? '...';
  const tier = profile?.vip_tier ?? 'INITIATE';
  const team = profile?.favourite_team;
  const { next, progress } = getTierInfo(xp);

  const betinaSays = team
    ? `Hey ${name}! I'm keeping an eye on ${team} for you. Ask me anything — fixtures, stats, news. 💬`
    : `Hey ${name}! I'm BETina — your AI companion. Ask me about any match, player or sport. 💬`;

  const featured = demoEvents.find((e) => e.featured)!;
  const secondary = demoEvents.find((e) => e.id === 'atp-finals')!;

  if (loading) {
    return (
      <ScreenBg glowTop={0.16} glowSize={460}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenBg>
    );
  }

  return (
    <ScreenBg glowTop={0.16} glowSize={460}>
      <ParticlesBg count={8} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* greeting header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerLeft}>
            <BETinaAvatar size={52} />
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.name}>{name} ⚡</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.tierPill}>
              <View style={styles.tierDot} />
              <Text style={styles.tierLabel}>{tier}</Text>
            </View>
            <Pressable onPress={() => router.push('/notifications')} style={styles.bell}>
              <Text style={styles.bellEmoji}>🔔</Text>
              <View style={styles.bellDot} />
            </Pressable>
          </View>
        </Animated.View>

        {/* BETina says */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Pressable onPress={() => router.push('/(tabs)/chat')} style={styles.betinaSays}>
            <Text style={styles.betinaSaysText}>
              {betinaSays}{' '}
              <Text style={styles.betinaSaysLink}>Ask me →</Text>
            </Text>
          </Pressable>
        </Animated.View>

        {/* XP card */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)}>
          <Pressable onPress={() => router.push('/tiers')}>
            <GlowCard style={styles.xpCard}>
              <View style={styles.xpTop}>
                <View style={styles.xpValueRow}>
                  <AnimatedNumber value={xp} style={styles.xpValue} />
                  <Text style={styles.xpUnit}>XP</Text>
                </View>
                {next && (
                  <Text style={styles.xpNext}>
                    {next.minXp - xp} XP to{' '}
                    <Text style={styles.xpNextTier}>{next.name}</Text>
                  </Text>
                )}
              </View>
              <XPBar progress={progress} />
              <View style={styles.xpLabels}>
                <Text style={styles.xpTierLabel}>{tier}</Text>
                {next && <Text style={styles.xpTierLabel}>{next.name}</Text>}
              </View>
            </GlowCard>
          </Pressable>
        </Animated.View>

        {/* today's events */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} style={styles.eventsBlock}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Today's events</Text>
            <Pressable onPress={() => router.push('/(tabs)/live')} hitSlop={8}>
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push(`/event/${featured.id}`)}>
            <GlowCard variant="purple" style={styles.featuredCard}>
              <View style={styles.featuredTop}>
                <Text style={styles.featuredLeague}>
                  {featured.leagueEmoji} {featured.league}
                </Text>
                <Text style={styles.featuredTime}>{featured.time}</Text>
              </View>
              <View style={styles.featuredTeams}>
                <Text style={styles.teamName}>{featured.home}</Text>
                <Text style={styles.vs}>vs</Text>
                <Text style={styles.teamName}>{featured.away}</Text>
              </View>
            </GlowCard>
          </Pressable>

          <GlowCard style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventLeague}>
                {secondary.leagueEmoji} {secondary.league}
              </Text>
              <Text style={styles.eventName}>
                {secondary.home} vs {secondary.away}
              </Text>
            </View>
            <Text style={styles.eventTime}>{secondary.time}</Text>
          </GlowCard>
        </Animated.View>

        {/* Open GeniusBet CTA */}
        <Animated.View entering={FadeInDown.delay(340).duration(500)}>
          <GlowButton
            label="Open GeniusBet"
            onPress={() => WebBrowser.openBrowserAsync(GENIUSBET_URL)}
            leftElement={
              <Image
                source={require('../../assets/logo-mark.png')}
                style={styles.ctaLogo}
                resizeMode="contain"
              />
            }
            rightElement={<Text style={styles.ctaArrow}>→</Text>}
          />
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.lg, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  greetingBlock: { gap: 2 },
  greeting: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Fonts.medium },
  name: { color: '#FFFFFF', fontSize: Typography.lg, fontFamily: Fonts.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tierPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  tierLabel: { color: '#FFFFFF', fontSize: Typography.xs + 1, fontFamily: Fonts.bold, letterSpacing: 0.7 },
  bell: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  bellEmoji: { fontSize: 16 },
  bellDot: {
    position: 'absolute', top: 5, right: 6,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.background,
  },
  betinaSays: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(107,33,168,0.22)',
    borderWidth: 1, borderColor: 'rgba(107,33,168,0.45)',
    borderRadius: 20, borderTopLeftRadius: 6,
    paddingVertical: 13, paddingHorizontal: 16,
  },
  betinaSaysText: { color: '#E8E8F0', fontSize: Typography.sm + 1, fontFamily: Fonts.medium, lineHeight: 21 },
  betinaSaysLink: { color: Colors.primary },
  xpCard: { padding: 18, gap: Spacing.md },
  xpTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  xpValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  xpValue: { color: '#FFFFFF', fontSize: Typography.xl, fontFamily: Fonts.bold },
  xpUnit: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Fonts.semibold },
  xpNext: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.medium },
  xpNextTier: { color: '#FFFFFF', fontFamily: Fonts.bold },
  xpLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTierLabel: { color: '#55556A', fontSize: Typography.xs, fontFamily: Fonts.semibold, letterSpacing: 0.9 },
  eventsBlock: { gap: Spacing.sm + 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: '#FFFFFF', fontSize: Typography.base + 1, fontFamily: Fonts.bold },
  sectionLink: { color: Colors.primary, fontSize: Typography.sm, fontFamily: Fonts.semibold },
  featuredCard: { padding: 18, gap: Spacing.sm + 2 },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredLeague: { color: Colors.primary, fontSize: Typography.xs, fontFamily: Fonts.bold, letterSpacing: 1.1 },
  featuredTime: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.semibold },
  featuredTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { color: '#FFFFFF', fontSize: Typography.base, fontFamily: Fonts.bold },
  vs: { color: '#55556A', fontSize: Typography.sm, fontFamily: Fonts.bold },
  eventCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18 },
  eventInfo: { gap: 3 },
  eventLeague: { color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Fonts.semibold, letterSpacing: 0.7 },
  eventName: { color: '#FFFFFF', fontSize: Typography.sm + 1, fontFamily: Fonts.semibold },
  eventTime: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.semibold },
  ctaLogo: { height: 16, width: 20, tintColor: Colors.background },
  ctaArrow: { color: Colors.background, fontSize: Typography.md - 1, fontFamily: Fonts.bold },
});
