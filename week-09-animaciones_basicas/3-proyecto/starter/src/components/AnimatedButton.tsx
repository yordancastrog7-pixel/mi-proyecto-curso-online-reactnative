import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

type Variant = 'primary' | 'danger' | 'outline';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
}

// ============================================
// AnimatedButton — se comprime rápido al tocar y rebota al soltar.
//   • Al presionar: `timing` de 80 ms (rápido y sin rebote, se siente
//     "instantáneo").
//   • Al soltar: `spring` (rebote). Combinar los dos da mejor tacto que
//     usar solo uno.
// ============================================
export function AnimatedButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
}: AnimatedButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 400,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[disabled && styles.disabled, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable
        style={[styles.button, variantStyles[variant]]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
      >
        <Text style={[styles.label, variant === 'outline' && styles.labelOutline, variant === 'danger' && styles.labelDanger]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  label: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  labelOutline: {
    color: COLORS.accent,
  },
  labelDanger: {
    color: COLORS.error,
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: COLORS.accent },
  danger: { borderWidth: 1, borderColor: COLORS.error },
  outline: { borderWidth: 1, borderColor: COLORS.accent },
});
