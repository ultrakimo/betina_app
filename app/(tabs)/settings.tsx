import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { LANGUAGES, LangCode, useI18n } from '../../src/lib/i18n';
import { supabase } from '../../src/lib/supabase';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

const RESPONSIBLE_GAMING_URL = 'https://www.begambleaware.org';

function Row({
  emoji, label, value, onPress, right, last,
}: {
  emoji: string; label: string; value?: string;
  onPress?: () => void; right?: React.ReactNode; last?: boolean;
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
  const { lang, setLang, t } = useI18n();
  const name = profile?.name ?? '...';
  const tier = profile?.vip_tier ?? 'INITIATE';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [eventReminders, setEventReminders] = useState(true);
  const [betinaMessages, setBetinaMessages] = useState(true);
  const [tierUpdates, setTierUpdates] = useState(false);

  // Language picker state
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LangCode>(lang);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentLangInfo = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const saveLang = async () => {
    setSaving(true);
    await setLang(selectedLang);
    // Also persist to Supabase profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, language: selectedLang });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setLangModalOpen(false); }, 1200);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenBg glowTop={0.12} glowSize={440}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>{t.settingsTitle}</Text>
        </Animated.View>

        {/* Profile card */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <GlowCard style={styles.profileCard}>
            <View style={styles.profileInitial}>
              <Text style={styles.profileInitialLabel}>{(name[0] || '?').toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileMeta}>{phone ?? '—'} · {tier}</Text>
            </View>
          </GlowCard>
        </Animated.View>

        {/* General */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.section}>
          <SectionLabel>GENERAL</SectionLabel>
          <GlowCard>
            <Row
              emoji="🌐"
              label={t.settingsLanguage}
              value={`${currentLangInfo.flag} ${currentLangInfo.nativeName}`}
              onPress={() => { setSelectedLang(lang); setLangModalOpen(true); }}
            />
            <Row emoji="🎨" label="Appearance" value="Dark" last />
          </GlowCard>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <SectionLabel>PUSH NOTIFICATIONS</SectionLabel>
          <GlowCard>
            <Row emoji="⚽" label="Event reminders" right={<Toggle value={eventReminders} onValueChange={setEventReminders} />} />
            <Row emoji="💬" label="Messages from BETina" right={<Toggle value={betinaMessages} onValueChange={setBetinaMessages} />} />
            <Row emoji="🏆" label="Tier & XP updates" right={<Toggle value={tierUpdates} onValueChange={setTierUpdates} />} last />
          </GlowCard>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)} style={styles.section}>
          <SectionLabel>SUPPORT</SectionLabel>
          <GlowCard>
            <Row emoji="💡" label="Help & support" onPress={() => {}} />
            <Row emoji="🛡️" label="Responsible gaming" right={<Text style={styles.externalHint}>↗</Text>} onPress={() => WebBrowser.openBrowserAsync(RESPONSIBLE_GAMING_URL)} />
            <Row emoji="📄" label="Terms & Privacy" onPress={() => {}} last />
          </GlowCard>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.section}>
          <GlowButton label={t.settingsLogout} variant="danger" onPress={logout} />
          <Text style={styles.version}>BETina v1.0 · powered by GeniusBet</Text>
        </Animated.View>
      </ScrollView>

      {/* ── Language Picker Modal ── */}
      <Modal visible={langModalOpen} transparent animationType="slide" onRequestClose={() => setLangModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLangModalOpen(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t.settingsLanguage}</Text>

          <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((l) => {
              const active = l.code === selectedLang;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setSelectedLang(l.code)}
                  style={[styles.langRow, active && styles.langRowActive]}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langNative, active && styles.langNativeActive]}>{l.nativeName}</Text>
                    <Text style={styles.langLabel}>{l.label}</Text>
                  </View>
                  {active && <Text style={styles.langCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={saveLang}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          >
            <Text style={styles.saveBtnLabel}>
              {saved ? t.settingsSaved : saving ? '…' : t.settingsSave}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  title: { color: '#FFF', fontSize: 26, fontFamily: Fonts.bold },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 14, paddingHorizontal: 16 },
  profileInitial: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(191,255,0,0.12)', borderWidth: 1, borderColor: 'rgba(191,255,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitialLabel: { color: Colors.primary, fontSize: Typography.md + 1, fontFamily: Fonts.bold },
  profileInfo: { flex: 1, gap: 1 },
  profileName: { color: '#FFF', fontSize: Typography.base + 1, fontFamily: Fonts.bold },
  profileMeta: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.medium },
  section: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12, paddingHorizontal: 16 },
  rowEmoji: { fontSize: 17 },
  rowLabel: { flex: 1, color: '#FFF', fontSize: Typography.sm + 1, fontFamily: Fonts.semibold },
  rowValue: { color: Colors.textSecondary, fontSize: Typography.sm, fontFamily: Fonts.medium },
  rowChevron: { color: '#55556A', fontSize: Typography.sm + 1 },
  externalHint: { color: '#55556A', fontSize: Typography.sm, fontFamily: Fonts.medium },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  version: { textAlign: 'center', color: '#3A3A4A', fontSize: Typography.xs, fontFamily: Fonts.medium, paddingTop: Spacing.xs },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#0F0F1F', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.lg, paddingTop: 12, maxHeight: '75%',
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#3A3A4A', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFF', fontSize: Typography.lg, fontFamily: Fonts.bold, marginBottom: 16 },
  langList: { maxHeight: 380 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
  },
  langRowActive: { backgroundColor: 'rgba(191,255,0,0.08)', borderWidth: 1, borderColor: 'rgba(191,255,0,0.2)' },
  langFlag: { fontSize: 28 },
  langNative: { color: '#FFF', fontSize: Typography.base, fontFamily: Fonts.semibold },
  langNativeActive: { color: Colors.primary },
  langLabel: { color: Colors.textSecondary, fontSize: Typography.xs + 1, fontFamily: Fonts.medium, marginTop: 2 },
  langCheck: { color: Colors.primary, fontSize: Typography.base + 2, fontFamily: Fonts.bold },
  saveBtn: {
    marginTop: 12, backgroundColor: Colors.primary,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  saveBtnLabel: { color: '#000', fontFamily: Fonts.bold, fontSize: Typography.base },
});
