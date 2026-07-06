import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '../../src/theme';

const TAB_META: Record<string, { emoji: string; label: string }> = {
  index: { emoji: '🏠', label: 'Home' },
  chat: { emoji: '💬', label: 'BETina' },
  journey: { emoji: '🚀', label: 'Journey' },
  live: { emoji: '⚽', label: 'Live & News' },
  settings: { emoji: '⚙️', label: 'Settings' },
};

// Minimal shape of the react-navigation tab bar props we actually use —
// expo-router vendors its own bottom-tabs types, so we don't import them.
type TabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

function GlassTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) + 12 }]}>
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={[styles.tab, !focused && styles.tabInactive]}
          >
            <Text style={styles.emoji}>{meta.emoji}</Text>
            <Text style={[styles.label, focused && styles.labelActive]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="journey" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,28,0.92)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    minWidth: 52,
  },
  tabInactive: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Fonts.semibold,
  },
  labelActive: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
});
