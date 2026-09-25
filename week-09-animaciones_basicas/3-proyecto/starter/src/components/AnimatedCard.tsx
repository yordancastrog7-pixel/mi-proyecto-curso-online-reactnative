import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

// ============================================
// AnimatedCard — la tarjeta "se hunde" al tocarla y rebota al soltar.
//
// `scaleAnim` es un Animated.Value (1 = tamaño normal). `spring` simula un
// resorte: por eso al soltar pasa un poquito de 1 y vuelve, en vez de
// frenar en seco como haría `timing`. Sirve de feedback: el usuario VE
// que su toque fue registrado.
//
// `useNativeDriver: true` porque `transform` sí se puede animar en el
// hilo nativo: la animación corre sin depender del hilo de JavaScript
// (no se traba aunque JS esté ocupado).
// ============================================
export function AnimatedCard({ children, onPress, style }: AnimatedCardProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.card, style, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pressable: {
    padding: SPACING.base,
    gap: SPACING.sm,
  },
});
