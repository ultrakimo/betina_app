import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import BETinaAvatar from '../../src/components/BETinaAvatar';
import ChatBubble from '../../src/components/ChatBubble';
import GlowCard from '../../src/components/GlowCard';
import ScreenBg from '../../src/components/ScreenBg';
import { askBetina } from '../../src/lib/claude';
import { useProfile } from '../../src/hooks/useProfile';
import { useI18n } from '../../src/lib/i18n';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  statCard?: { goals: number; assists: number; rating: number };
  xpNote?: string;
};

function makeInitialMessages(name: string): Message[] {
  return [
    {
      id: 'm1',
      role: 'assistant',
      content: `Hey ${name}! 👋 I'm BETina, your AI sports companion. Ask me anything — match previews, live scores, stats, or anything about your team.`,
    },
  ];
}

const QUICK_REPLIES = ['Show lineups', 'Head-to-head', 'Remind me'];

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.typingDot, style]} />;
}

export default function Chat() {
  const { t } = useI18n();
  const { profile } = useProfile();
  const userName = profile?.name ?? 'friend';
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages(makeInitialMessages(userName));
  }, [userName]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
    const reply = await askBetina(history, userName);

    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: `a${Date.now()}`, role: 'assistant', content: reply, xpNote: '+15 XP for chatting' },
    ]);
  };

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages, typing]);

  return (
    <ScreenBg glowTop={0.3} glowSize={460}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* chat header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <BETinaAvatar size={46} online />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>
              BET<Text style={styles.headerNameAccent}>ina</Text>
            </Text>
            <Text style={styles.headerStatus}>online · watching El Clásico buildup</Text>
          </View>
          <Pressable style={styles.headerMore}>
            <Text style={styles.headerMoreLabel}>⋯</Text>
          </Pressable>
        </View>

        {/* messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.timestamp}>TODAY, 19:42</Text>
          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.duration(300)}
              style={msg.role === 'user' ? styles.userWrap : undefined}
            >
              <ChatBubble role={msg.role}>{msg.content}</ChatBubble>
              {msg.statCard && (
                <View style={styles.statCardWrap}>
                  <GlowCard style={styles.statCard}>
                    <View style={styles.stat}>
                      <Text style={styles.statValueGreen}>{msg.statCard.goals}</Text>
                      <Text style={styles.statLabel}>Goals</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{msg.statCard.assists}</Text>
                      <Text style={styles.statLabel}>Assists</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{msg.statCard.rating}</Text>
                      <Text style={styles.statLabel}>Avg rating</Text>
                    </View>
                  </GlowCard>
                </View>
              )}
              {msg.xpNote && (
                <Text style={styles.xpNote}>
                  {msg.xpNote} <Text style={styles.xpDot}>●</Text>
                </Text>
              )}
            </Animated.View>
          ))}

          {typing && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.typingRow}>
              <BETinaAvatar size={30} />
              <View style={styles.typingBubble}>
                <TypingDot delay={0} />
                <TypingDot delay={200} />
                <TypingDot delay={400} />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* quick replies + input */}
        <View style={[styles.inputBlock, { paddingBottom: Math.max(insets.bottom, 12) + 96 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickReplies}
          >
            {QUICK_REPLIES.map((qr) => (
              <Pressable key={qr} onPress={() => send(qr)} style={styles.quickReply}>
                <Text style={styles.quickReplyLabel}>{qr}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message BETina…"
              placeholderTextColor="#55556A"
              style={styles.input}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <Pressable onPress={() => send(input)} style={styles.sendButton}>
              <Text style={styles.sendLabel}>↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,10,15,0.7)',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: Typography.md,
    fontFamily: Fonts.bold,
  },
  headerNameAccent: {
    color: Colors.primary,
  },
  headerStatus: {
    color: Colors.primary,
    fontSize: Typography.xs + 1,
    fontFamily: Fonts.medium,
  },
  headerMore: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMoreLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  messages: {
    gap: 14,
    paddingHorizontal: Spacing.lg,
    paddingTop: 18,
    paddingBottom: Spacing.sm,
  },
  timestamp: {
    alignSelf: 'center',
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
    letterSpacing: 0.9,
  },
  userWrap: {
    alignItems: 'flex-end',
  },
  statCardWrap: {
    paddingLeft: 38,
    paddingTop: Spacing.sm,
  },
  statCard: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    alignSelf: 'flex-start',
  },
  stat: { gap: 2 },
  statValueGreen: {
    color: Colors.primary,
    fontSize: Typography.lg,
    fontFamily: Fonts.bold,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: Typography.lg,
    fontFamily: Fonts.bold,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
  },
  xpNote: {
    color: '#55556A',
    fontSize: Typography.xs,
    fontFamily: Fonts.semibold,
    paddingLeft: 38,
    paddingTop: 6,
  },
  xpDot: {
    color: Colors.primary,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(107,33,168,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(107,33,168,0.45)',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  inputBlock: {
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  quickReplies: {
    gap: Spacing.sm,
  },
  quickReply: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: Spacing.base,
  },
  quickReplyLabel: {
    color: '#E8E8F0',
    fontSize: Typography.sm,
    fontFamily: Fonts.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: Typography.sm + 1,
    fontFamily: Fonts.medium,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sendLabel: {
    color: Colors.background,
    fontSize: Typography.md + 1,
    fontFamily: Fonts.bold,
  },
});
