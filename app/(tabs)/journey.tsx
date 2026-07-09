import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AnimatedNumber from '../../src/components/AnimatedNumber';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import XPBar from '../../src/components/XPBar';
import { tiers } from '../../src/lib/demo';
import { SPORT_KEYS, useI18n } from '../../src/lib/i18n';
import { sportEmoji } from '../../src/lib/sports';
import { useProfile } from '../../src/hooks/useProfile';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function Journey() {
  const { t, lang } = useI18n();
  const { profile, loading } = useProfile();
  const [chatCount, setChatCount] = useState(0);

  // Real count of messages the player has sent BETina
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'user');
        if (typeof count === 'number') setChatCount(count);
      } catch {
        // offline / demo — leave at 0
      }
    })();
  }, []);
  const xp = profile?.xp_points ?? 0;
  const tierName = profile?.vip_tier ?? 'INITIATE';
  const team = profile?.favourite_team ?? null;
  const sport = profile?.favourite_sport ?? null;
  const sportKey = sport ? SPORT_KEYS[sport.toLowerCase()] : undefined;
  const sportLabel = sportKey ? t[sportKey] : (sport ?? '');
  const streakDays = profile?.streak_days ?? 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(lang, { month: 'long', year: 'numeric' })
    : '—';
  const currentTierIndex = tiers.findIndex((t) => t.name === tierName);
  const currentTierObj = tiers[currentTierIndex] ?? tiers[0];
  const nextTierObj = tiers[currentTierIndex + 1] ?? null;
  const xpForNextTier = nextTierObj ? nextTierObj.minXp : currentTierObj.minXp;
  const progress = nextTierObj
    ? (xp - currentTierObj.minXp) / (nextTierObj.minXp - currentTierObj.minXp)
    : 1;
  const insets = useSafeAreaInsets();
  

  return (
    <ScreenBg glowTop={0.14} glowSize={460}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* header + XP */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{t.journeyTitle}</Text>
            <Text style={styles.subtitle}>{t.journeyMember} {memberSince}</Text>
          </View>
          <View style={styles.headerRight}>
            <AnimatedNumber value={xp} style={styles.xpValue} />
            <Text style={styles.xpLabel}>{t.journeyTotalXp}</Text>
          </View>
        </Animated.View>

        {/* tier timeline */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <GlowCard style={styles.timeline}>
            {tiers.map((tier, i) => {
              const done = i < currentTierIndex;
              const current = i === currentTierIndex;
              const last = i === tiers.length - 1;
              return (
                <View key={tier.name} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineNode,
                        done && styles.nodeDone,
                        current && styles.nodeCurrent,
                        tier.gold && styles.nodeGold,
                      ]}
                    >
                      <Text
                        style={[
                          styles.nodeLabel,
                          done && styles.nodeLabelDone,
                          current && styles.nodeLabelCurrent,
                          tier.gold && styles.nodeLabelGold,
                        ]}
                      >
                        {tier.gold ? '👑' : done ? '✓' : current ? '★' : i + 1}
                      </Text>
                    </View>
                    {!last && (
                      <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
                    )}
                  </View>
                  <View style={[styles.timelineBody, last && { paddingBottom: 0 }]}>
                    <View style={styles.timelineTitleRow}>
                      <Text
                        style={[
                          styles.tierName,
                          current && styles.tierNameCurrent,
                          tier.gold && styles.tierNameGold,
                        ]}
                      >
                        {tier.name}
                      </Text>
                      {current && (
                        <View style={styles.currentPill}>
                          <Text style={styles.currentPillLabel}>{t.journeyCurrentTier}</Text>
                        </View>
                      )}
                    </View>
                    {current ? (
                      <View style={styles.currentProgress}>
                        <XPBar progress={progress} height={6} />
                        <Text style={styles.tierMeta}>
                          {xp.toLocaleString('en-US')} /{' '}
                          {xpForNextTier.toLocaleString('en-US')} XP ·{' '}
                          {xpForNextTier - xp} {t.journeyToNext}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.tierMeta}>
                        {done
                          ? `${tier.minXp.toLocaleString('en-US')} XP · ${t.journeyCompleted}`
                          : `${tier.minXp.toLocaleString('en-US')} XP${tier.gold ? ` · ${t.tiersTop1}` : ''}`}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </GlowCard>
        </Animated.View>

        {/* activity stats grid — real data only */}
        <Animated.View entering={FadeInDown.delay(220).duration(500)} style={styles.grid}>
          <GlowCard style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {streakDays}</Text>
            <Text style={styles.statLabel}>{t.journeyDayStreak}</Text>
          </GlowCard>
          <GlowCard style={styles.statCard}>
            <AnimatedNumber value={chatCount} style={styles.statValue} format={false} />
            <Text style={styles.statLabel}>{t.journeyChats}</Text>
          </GlowCard>
          <GlowCard style={styles.statCard}>
            <Text style={styles.statValue}>{sport ? `${sportEmoji(sport)} ${sportLabel}` : '—'}</Text>
            <Text style={styles.statLabel}>{t.journeyFavSport}</Text>
          </GlowCard>
          <GlowCard style={styles.statCard}>
            <Text style={styles.teamValue} numberOfLines={1}>{team ?? '—'}</Text>
            <Text style={styles.statLabel}>{t.journeyTopTeam}</Text>
          </GlowCard>
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerLeft: { gap: 2 },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  xpValue: {
    color: Colors.primary,
    fontSize: 28,
    fontFamily: Fonts.bold,
    lineHeight: 30,
  },
  xpLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  timeline: {
    padding: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineRail: {
    alignItems: 'center',
    width: 26,
  },
  timelineNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {
    backgroundColor: 'rgba(191,255,0,0.15)',
    borderColor: Colors.primary,
  },
  nodeCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeGold: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderColor: 'rgba(255,215,0,0.5)',
  },
  nodeLabel: {
    color: '#55556A',
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  nodeLabelDone: {
    color: Colors.primary,
  },
  nodeLabelCurrent: {
    color: Colors.background,
  },
  nodeLabelGold: {
    fontSize: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  timelineLineDone: {
    backgroundColor: Colors.primary,
  },
  timelineBody: {
    flex: 1,
    gap: 5,
    paddingBottom: 14,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierName: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Fonts.bold,
    letterSpacing: 0.8,
  },
  tierNameCurrent: {
    color: '#FFFFFF',
    fontSize: Typography.base,
  },
  tierNameGold: {
    color: Colors.gold,
  },
  currentPill: {
    backgroundColor: 'rgba(191,255,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(191,255,0,0.4)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  currentPillLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  currentProgress: {
    gap: 6,
    paddingTop: 2,
  },
  tierMeta: {
    color: '#55556A',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 2,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
  },
  statCardWide: {
    width: '100%',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: Typography.lg + 2,
    fontFamily: Fonts.bold,
  },
  statValueGold: {
    color: Colors.gold,
    fontSize: Typography.lg + 2,
    fontFamily: Fonts.bold,
  },
  statValueGreen: {
    color: Colors.primary,
    fontSize: Typography.lg + 2,
    fontFamily: Fonts.bold,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teamValue: {
    color: '#FFFFFF',
    fontSize: Typography.md + 1,
    fontFamily: Fonts.bold,
  },
  activeDaysRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  activeDaysMeta: {
    color: '#55556A',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
  },
});
