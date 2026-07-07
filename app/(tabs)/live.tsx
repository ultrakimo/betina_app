import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import { useProfile } from '../../src/hooks/useProfile';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const API = 'https://intelligence.geniusbet.com';

const ALL_SPORT_TABS = [
  { id: 'football',   label: '⚽ Football' },
  { id: 'tennis',     label: '🎾 Tennis' },
  { id: 'basketball', label: '🏀 Basketball' },
  { id: 'cricket',    label: '🏏 Cricket' },
  { id: 'rugby',      label: '🏉 Rugby' },
  { id: 'athletics',  label: '🏃 Athletics' },
  { id: 'golf',       label: '⛳ Golf' },
  { id: 'sport',      label: '🌍 All Sports' },
];

// Map app sport IDs to BBC feed IDs
const SPORT_TO_BBC: Record<string, string> = {
  football: 'football', tennis: 'tennis', basketball: 'sport',
  cricket: 'cricket', rugby: 'rugby', athletics: 'athletics',
  golf: 'golf', nfl: 'sport', mma: 'sport', esports: 'sport',
};

type NewsItem = { title: string; description: string; link: string; pubDate: string };
type MatchEvent = { id: string; name: string; home: string; away: string; homeScore: string | null; awayScore: string | null; date: string; time: string; league: string };

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000 / 60 / 60;
  if (diff < 1) return 'Just now';
  if (diff < 24) return `${Math.floor(diff)}h ago`;
  return `${Math.floor(diff / 24)}d ago`;
}

function formatMatchDate(dateStr: string, timeStr: string) {
  const d = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    (timeStr ? ' · ' + timeStr.slice(0, 5) : '');
}

export default function Live() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [sport, setSport] = useState('football');
  const [activeTabs, setActiveTabs] = useState(ALL_SPORT_TABS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [nextEvents, setNextEvents] = useState<MatchEvent[]>([]);
  const [lastEvents, setLastEvents] = useState<MatchEvent[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const teamId = (profile as any)?.favourite_team_id ?? null;
  const teamName = profile?.favourite_team ?? null;

  useEffect(() => {
    if (!profile) return;
    const saved = (profile as any)?.favourite_sports as string | null;
    if (saved) {
      const sportIds = saved.split(',').filter(Boolean);
      const filtered = ALL_SPORT_TABS.filter(
        (t) => sportIds.some((s) => SPORT_TO_BBC[s] === t.id || t.id === 'sport')
      );
      setActiveTabs(filtered.length > 0 ? [...filtered, ALL_SPORT_TABS[ALL_SPORT_TABS.length - 1]] : ALL_SPORT_TABS);
      // Default to first selected sport
      const firstBbc = SPORT_TO_BBC[sportIds[0]] ?? 'sport';
      setSport(firstBbc);
    }
  }, [profile?.favourite_sports]);

  useEffect(() => { fetchNews(); }, [sport]);
  useEffect(() => { if (teamId) fetchTeamData(); }, [teamId]);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const r = await fetch(`${API}/api/sports/news?sport=${sport}&count=10`);
      const d = await r.json();
      setNews(d.items ?? []);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchTeamData = async () => {
    if (!teamId) return;
    setLoadingTeam(true);
    try {
      const [nextR, lastR] = await Promise.all([
        fetch(`${API}/api/sports/team/${teamId}/next`),
        fetch(`${API}/api/sports/team/${teamId}/last`),
      ]);
      const nextD = await nextR.json();
      const lastD = await lastR.json();
      setNextEvents(nextD.events ?? []);
      setLastEvents(lastD.events ?? []);
    } finally {
      setLoadingTeam(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNews(), teamId ? fetchTeamData() : Promise.resolve()]);
    setRefreshing(false);
  };

  return (
    <ScreenBg glowTop={0.14} glowSize={460}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.title}>Live & News</Text>
          <Pressable onPress={() => router.push('/notifications')} style={styles.bell}>
            <Text style={styles.bellEmoji}>🔔</Text>
            <View style={styles.bellDot} />
          </Pressable>
        </Animated.View>

        {/* YOUR TEAM section */}
        {teamName && (
          <Animated.View entering={FadeInDown.delay(60).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>🏟 {teamName}</Text>

            {loadingTeam ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
            ) : (
              <>
                {nextEvents.length > 0 && (
                  <GlowCard style={styles.matchCard}>
                    <Text style={styles.matchLabel}>UPCOMING</Text>
                    {nextEvents.slice(0, 3).map((e) => (
                      <View key={e.id} style={styles.matchRow}>
                        <View style={styles.matchTeams}>
                          <Text style={styles.matchTeam}>{e.home}</Text>
                          <Text style={styles.matchVs}>vs</Text>
                          <Text style={styles.matchTeam}>{e.away}</Text>
                        </View>
                        <View style={styles.matchMeta}>
                          <Text style={styles.matchLeague}>{e.league}</Text>
                          <Text style={styles.matchDate}>{formatMatchDate(e.date, e.time)}</Text>
                        </View>
                      </View>
                    ))}
                  </GlowCard>
                )}

                {lastEvents.length > 0 && (
                  <GlowCard style={styles.matchCard}>
                    <Text style={styles.matchLabel}>RECENT RESULTS</Text>
                    {lastEvents.slice(0, 3).map((e) => (
                      <View key={e.id} style={styles.matchRow}>
                        <View style={styles.matchTeams}>
                          <Text style={styles.matchTeam}>{e.home}</Text>
                          <Text style={[styles.matchScore, styles.matchScoreBig]}>
                            {e.homeScore ?? '?'} – {e.awayScore ?? '?'}
                          </Text>
                          <Text style={styles.matchTeam}>{e.away}</Text>
                        </View>
                        <Text style={styles.matchDate}>{e.date}</Text>
                      </View>
                    ))}
                  </GlowCard>
                )}

                {!nextEvents.length && !lastEvents.length && (
                  <GlowCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No upcoming fixtures found for {teamName}</Text>
                  </GlowCard>
                )}
              </>
            )}
          </Animated.View>
        )}

        {/* Sport tab pills */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {activeTabs.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setSport(t.id)}
                style={[styles.tab, sport === t.id && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, sport === t.id && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* News */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Latest News</Text>

          {loadingNews ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : news.length === 0 ? (
            <GlowCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No news available right now</Text>
            </GlowCard>
          ) : (
            news.map((item, idx) => (
              <Pressable key={idx} onPress={() => item.link && Linking.openURL(item.link)}>
                <GlowCard style={styles.newsCard}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.newsDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.newsTime}>{timeAgo(item.pubDate)} · BBC Sport</Text>
                </GlowCard>
              </Pressable>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#FFFFFF', fontSize: Typography.xl - 2, fontFamily: Fonts.bold },
  bell: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  bellEmoji: { fontSize: 16 },
  bellDot: {
    position: 'absolute', top: 5, right: 6, width: 9, height: 9,
    borderRadius: 5, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.background,
  },
  section: { gap: 10 },
  sectionTitle: { color: '#FFFFFF', fontSize: Typography.base + 1, fontFamily: Fonts.bold, paddingLeft: 2 },
  tabs: { gap: 8, paddingVertical: 2 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: Colors.glass,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  tabActive: { backgroundColor: 'rgba(191,255,0,0.14)', borderColor: 'rgba(191,255,0,0.6)' },
  tabLabel: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Fonts.semibold },
  tabLabelActive: { color: '#FFFFFF' },
  matchCard: { gap: 12, padding: 16 },
  matchLabel: {
    color: Colors.primary, fontSize: Typography.xs, fontFamily: Fonts.bold,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  matchRow: { gap: 4 },
  matchTeams: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchTeam: { flex: 1, color: '#FFFFFF', fontSize: Typography.sm + 1, fontFamily: Fonts.semibold },
  matchVs: { color: '#55556A', fontSize: Typography.xs + 1, fontFamily: Fonts.bold },
  matchScore: { color: Colors.primary, fontFamily: Fonts.bold },
  matchScoreBig: { fontSize: Typography.base, paddingHorizontal: 4 },
  matchMeta: { gap: 2 },
  matchLeague: { color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Fonts.medium },
  matchDate: { color: Colors.textSecondary, fontSize: Typography.xs, fontFamily: Fonts.medium },
  newsCard: { gap: 8, padding: 16 },
  newsTitle: { color: '#FFFFFF', fontSize: Typography.sm + 1, fontFamily: Fonts.semibold, lineHeight: 20 },
  newsDesc: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.medium, lineHeight: 18 },
  newsTime: { color: '#55556A', fontSize: Typography.xs, fontFamily: Fonts.medium },
  emptyCard: { padding: 20, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Fonts.medium, textAlign: 'center' },
});
