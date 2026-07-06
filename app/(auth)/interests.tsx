import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import GlowButton from '../../src/components/GlowButton';
import ScreenBg from '../../src/components/ScreenBg';
import TeamBadge from '../../src/components/TeamBadge';
import { sports } from '../../src/lib/demo';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function Interests() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [selected, setSelected] = useState<string[]>(['football', 'tennis']);
  const [teamSelected, setTeamSelected] = useState(true);

  const toggleSport = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const finish = async (skip = false) => {
    if (!skip) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            favourite_sport: selected[0] ?? null,
            favourite_team: teamSelected ? 'FC Barcelona' : null,
          })
          .eq('id', data.user.id);
      }
    }
    router.push({ pathname: '/(auth)/welcome', params: { name: name ?? '' } });
  };

  return (
    <ScreenBg glowTop={0.14} glowSize={420}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
      >
        {/* back + step progress */}
        <View style={styles.topBar}>
          <BackButton />
          <View style={styles.progress}>
            <View style={styles.progressSeg} />
            <View style={[styles.progressSeg, styles.progressActive]} />
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(600)} style={styles.headerBlock}>
          <Text style={styles.title}>What are you into?</Text>
          <Text style={styles.subtitle}>Pick your sports so BETina knows what to watch for you.</Text>
        </Animated.View>

        {/* sport chips */}
        <Animated.View entering={FadeInDown.delay(120).duration(600)} style={styles.chips}>
          {sports.map((sport) => {
            const active = selected.includes(sport.id);
            return (
              <Pressable
                key={sport.id}
                onPress={() => toggleSport(sport.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {sport.emoji} {sport.label}
                </Text>
                {active && <Text style={styles.chipCheck}>✓</Text>}
              </Pressable>
            );
          })}
        </Animated.View>

        {/* favorite team */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.teamBlock}>
          <Text style={styles.fieldLabel}>Favorite team</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTeamSelected((v) => !v);
            }}
            style={[styles.teamRow, teamSelected && styles.teamRowActive]}
          >
            <View style={styles.teamLeft}>
              <TeamBadge short="FCB" size={34} />
              <Text style={styles.teamName}>FC Barcelona</Text>
            </View>
            {teamSelected && <Text style={styles.teamCheck}>✓</Text>}
          </Pressable>
          <Text style={styles.teamHint}>BETina will track every Barça match for you.</Text>
        </Animated.View>

        <View style={styles.spacer} />

        <View style={styles.ctaBlock}>
          <GlowButton label="Finish setup" onPress={() => finish(false)} />
          <Pressable onPress={() => finish(true)} hitSlop={8} style={styles.skip}>
            <Text style={styles.skipLabel}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 26,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 2,
    paddingBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  chipActive: {
    backgroundColor: 'rgba(191,255,0,0.14)',
    borderColor: 'rgba(191,255,0,0.6)',
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.semibold,
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  chipCheck: {
    color: Colors.primary,
    fontSize: Typography.sm + 1,
  },
  teamBlock: {
    gap: Spacing.sm + 2,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  teamRowActive: {
    borderColor: 'rgba(191,255,0,0.45)',
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
    fontFamily: Fonts.semibold,
  },
  teamCheck: {
    color: Colors.primary,
    fontSize: Typography.base,
  },
  teamHint: {
    color: '#55556A',
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  spacer: { flex: 1, minHeight: Spacing.xl },
  ctaBlock: {
    gap: Spacing.base - 2,
  },
  skip: {
    alignItems: 'center',
  },
  skipLabel: {
    color: '#55556A',
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
  },
});
