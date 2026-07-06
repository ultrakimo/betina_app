import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Animation } from '../theme';

type Props = {
  value: number;
  style?: TextStyle | TextStyle[];
  /** Format with thousands separator */
  format?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
};

/** Numbers in BETina never appear statically — they count up. */
export default function AnimatedNumber({
  value,
  style,
  format = true,
  prefix = '',
  suffix = '',
  duration = Animation.cinematic,
  delay = 200,
}: Props) {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(value, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, [value, duration, delay, progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) runOnJS(setDisplay)(current);
    },
  );

  const text = format ? display.toLocaleString('en-US') : String(display);
  return (
    <Text style={style}>
      {prefix}
      {text}
      {suffix}
    </Text>
  );
}
