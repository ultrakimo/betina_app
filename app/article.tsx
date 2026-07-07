import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, Fonts, Spacing, Typography } from '../src/theme';

const { width: W, height: H } = Dimensions.get('window');
const API = 'https://intelligence.geniusbet.com';

type Article = {
  title: string;
  image: string;
  description: string;
  paragraphs: string[];
  source: string;
  url: string;
};

export default function ArticleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title: paramTitle } = useLocalSearchParams<{ url: string; title?: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    fetch(`${API}/api/sports/article?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => { setArticle(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);

  return (
    <View style={styles.root}>
      {/* Fixed back button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 10 }]}
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading article…</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorText}>Couldn't load article</Text>
          <Pressable onPress={() => router.back()} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Go back</Text>
          </Pressable>
        </View>
      )}

      {article && !loading && (
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          >
            {/* Hero Image */}
            <View style={styles.heroWrap}>
              {article.image ? (
                <Image
                  source={{ uri: article.image }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.heroImage, styles.heroPlaceholder]}>
                  <Text style={styles.heroPlaceholderEmoji}>📰</Text>
                </View>
              )}
              {/* gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(10,10,20,0.7)', Colors.background]}
                style={styles.heroGradient}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Source badge */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.sourceBadge}>
                <Text style={styles.sourceText}>📡 {article.source}</Text>
              </Animated.View>

              {/* Title */}
              <Animated.Text
                entering={FadeInDown.delay(150).duration(400)}
                style={styles.title}
              >
                {article.title || paramTitle || 'Article'}
              </Animated.Text>

              {/* Description */}
              {article.description ? (
                <Animated.Text
                  entering={FadeInDown.delay(200).duration(400)}
                  style={styles.description}
                >
                  {article.description}
                </Animated.Text>
              ) : null}

              {/* Divider */}
              <Animated.View
                entering={FadeInDown.delay(250).duration(400)}
                style={styles.divider}
              />

              {/* Body paragraphs */}
              {article.paragraphs.map((para, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeInDown.delay(280 + i * 30).duration(400)}
                  style={styles.para}
                >
                  {para}
                </Animated.Text>
              ))}

              {/* BETina CTA */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                style={styles.betinaCard}
              >
                <LinearGradient
                  colors={['rgba(191,255,0,0.08)', 'rgba(120,80,255,0.08)']}
                  style={styles.betinaGradient}
                >
                  <Text style={styles.betinaEmoji}>⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.betinaTitle}>Ask BETina about this</Text>
                    <Text style={styles.betinaDesc}>Get analysis, predictions and more</Text>
                  </View>
                  <Pressable
                    onPress={() => router.push('/(tabs)/chat')}
                    style={styles.betinaBtn}
                  >
                    <Text style={styles.betinaBtnLabel}>Chat →</Text>
                  </Pressable>
                </LinearGradient>
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  backBtn: {
    position: 'absolute', left: Spacing.lg, zIndex: 100,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(10,10,20,0.7)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#FFFFFF', fontSize: 20, fontFamily: Fonts.bold, lineHeight: 24 },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.sm },
  errorEmoji: { fontSize: 48 },
  errorText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.base, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 999, backgroundColor: Colors.glass,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  retryLabel: { color: '#FFFFFF', fontFamily: Fonts.semibold, fontSize: Typography.sm },
  heroWrap: { width: W, height: H * 0.42, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  heroPlaceholderEmoji: { fontSize: 64 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 8, gap: 14 },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(191,255,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(191,255,0,0.25)',
  },
  sourceText: { color: Colors.primary, fontSize: Typography.xs, fontFamily: Fonts.bold, letterSpacing: 0.5 },
  title: {
    color: '#FFFFFF', fontSize: Typography.xl + 2,
    fontFamily: Fonts.bold, lineHeight: 32,
  },
  description: {
    color: 'rgba(255,255,255,0.75)', fontSize: Typography.base,
    fontFamily: Fonts.medium, lineHeight: 24, fontStyle: 'italic',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  para: {
    color: 'rgba(255,255,255,0.85)', fontSize: Typography.sm + 1,
    fontFamily: Fonts.regular, lineHeight: 26,
  },
  betinaCard: {
    marginTop: 8, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(191,255,0,0.2)',
    overflow: 'hidden',
  },
  betinaGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  betinaEmoji: { fontSize: 28 },
  betinaTitle: { color: '#FFFFFF', fontFamily: Fonts.bold, fontSize: Typography.sm + 1 },
  betinaDesc: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.xs + 1, marginTop: 2 },
  betinaBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  betinaBtnLabel: { color: '#000000', fontFamily: Fonts.bold, fontSize: Typography.sm },
});
