import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

// Colores EXACTOS que pide la especificación: rojo → amarillo → verde.
const COLOR_LOW = '#ef4444';
const COLOR_MID = '#facc15';
const COLOR_HIGH = '#22c55e';

interface ProgressBarProps {
  // Progreso entre 0 y 1 (en el dominio: lecciones completadas / total)
  progress: number;
  label?: string;
  detail?: string;
}

// ============================================
// ProgressBar — barra que se LLENA animada y cambia de color.
//
// Un solo Animated.Value (`progressAnim`, de 0 a `progress`) alimenta dos
// `interpolate`:
//   • ancho:  [0, 1]        → ['0%', '100%']
//   • color:  [0, 0.5, 1]   → [rojo, amarillo, verde]
// `interpolate` traduce el número 0-1 a otro rango (un porcentaje, un
// color). `extrapolate: 'clamp'` evita que valores fuera de [0, 1]
// sigan "estirando" el resultado (sin él, 1.2 daría un ancho de 120%).
//
// ⚠️ useNativeDriver: FALSE aquí es lo correcto, no un descuido: el driver
// nativo solo anima `opacity` y `transform`. `width` y `backgroundColor`
// obligan a recalcular el layout/pintura y solo se pueden animar desde JS.
// (En las demás animaciones, que sí son opacity/transform, va `true`.)
// ============================================
export function ProgressBar({ progress, label, detail }: ProgressBarProps): React.JSX.Element {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const widthInterp = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const colorInterp = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLOR_LOW, COLOR_MID, COLOR_HIGH],
    extrapolate: 'clamp',
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {label !== undefined && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.percentage}>
            {detail ? `${detail} · ` : ''}
            {percentage}%
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: widthInterp, backgroundColor: colorInterp }]}
          testID="progress-fill"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs + 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.xs + 1,
  },
  percentage: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.xs + 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  track: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 5,
  },
});
