import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BackButton from '../src/components/BackButton';
import BETinaAvatar from '../src/components/BETinaAvatar';
import GlowCard from '../src/components/GlowCard';
import ScreenBg from '../src/components/ScreenBg';
import SectionLabel from '../src/components/SectionLabel';
import { demoNotifications, DemoNotification } from '../src/lib/demo';
import { Colors, Fonts, Spacing, Typography } from '../src/theme';

function NotificationCard({ item, index }: { item: DemoNotification; index: number }) {
  const isTierUp = item.kind === 'tierup';
  const isBetina = item.kind === 'betina';
  const dimmed = !item.unread;

  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).duration(450)}>
      <GlowCard
        variant={isTierUp ? 'gold' : 'glass'}
        style={[
          styles.card,
          isBetina && styles.betinaCard,
          dimmed && { opacity: 0.75 },
        ]}
      >
        {isBetina ? (
          <BETinaAvatar size={42} />
        ) : (
          <View
            style={[
              styles.iconBox,
              isTierUp && styles.iconBoxGold,
              item.kind === 'event' && styles.iconBoxGreen,
            ]}
          >
            <Text style={styles.iconEmoji}>{item.icon}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, isTierUp && styles.cardTitleGold]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.timeWrap}>
              {item.unread && <View style={styles.unreadDot} />}
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
          <Text style={styles.cardText}>{item.body}</Text>
        </View>
      </GlowCard>
    </Animated.View>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(demoNotifications);
  const unreadCount = items.filter((n) => n.unread).length;
  const sections: Array<'TODAY' | 'YESTERDAY'> = ['TODAY', 'YESTERDAY'];

  return (
    <ScreenBg glowTop={0.16} glowSize={460}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton />
            <Text style={styles.title}>Notifications</Text>
          </View>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <View style={styles.newPill}>
                <Text style={styles.newPillLabel}>{unreadCount} NEW</Text>
              </View>
            )}
            <Pressable
              onPress={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
              hitSlop={8}
            >
              <Text style={styles.markRead}>Mark all read</Text>
            </Pressable>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section} style={styles.section}>
            <SectionLabel>{section}</SectionLabel>
            {items
              .filter((n) => n.section === section)
              .map((item, i) => (
                <NotificationCard key={item.id} item={item} index={i} />
              ))}
          </View>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: Typography.xl,
    fontFamily: Fonts.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  newPill: {
    backgroundColor: 'rgba(191,255,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(191,255,0,0.4)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  newPillLabel: {
    color: Colors.primary,
    fontSize: Typography.xs,
    fontFamily: Fonts.bold,
  },
  markRead: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontFamily: Fonts.semibold,
  },
  section: {
    gap: Spacing.sm + 2,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  betinaCard: {
    backgroundColor: 'rgba(107,33,168,0.18)',
    borderColor: 'rgba(107,33,168,0.4)',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxGold: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderColor: 'rgba(255,215,0,0.35)',
  },
  iconBoxGreen: {
    backgroundColor: 'rgba(191,255,0,0.1)',
    borderColor: 'rgba(191,255,0,0.3)',
  },
  iconEmoji: { fontSize: 20 },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.bold,
  },
  cardTitleGold: {
    color: Colors.gold,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  time: {
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Fonts.medium,
    lineHeight: 19,
  },
});
