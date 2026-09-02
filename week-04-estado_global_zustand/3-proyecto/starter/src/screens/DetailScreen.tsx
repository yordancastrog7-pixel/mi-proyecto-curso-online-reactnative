import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { useCartStore } from '../stores/cartStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { HomeStackParamList } from '../navigation/types';
import type { Item } from '../types';

type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'HomeDetail'>;

export function DetailScreen(): React.JSX.Element {
  const route = useRoute<DetailScreenRouteProp>();
  const {
    id,
    name,
    description,
    instructor,
    price,
    category,
    duration,
    level,
    available,
  } = route.params;

  // El curso completo, tal como lo pide `addItem(item: Item)` del store.
  // Ya llegó completo por params, así que no hace falta buscarlo de nuevo
  // en mockData.ts.
  const item: Item = {
    id,
    name,
    description,
    instructor,
    price,
    category: category as Item['category'],
    duration,
    level: level as Item['level'],
    available,
  };

  // ============================================
  // SELECTORES ESPECÍFICOS DEL STORE
  //
  // OJO con este detalle (me costó un bug real la primera vez):
  // `inCart` se selecciona calculando el booleano DENTRO del selector
  // (`state.items.some(...)`), no llamando a `state.isItemInCart(id)`
  // por fuera. Un selector que devuelve la FUNCIÓN `isItemInCart` no
  // cambia nunca de referencia (es la misma función siempre), así que
  // Zustand nunca detecta que "cambió" y este componente no se
  // re-renderiza cuando agregas o quitas el curso — el botón se queda
  // con el texto viejo aunque el store sí se actualizó (el badge del
  // tab sí cambia, porque ese selecciona `items.length`, un valor que
  // sí cambia). Seleccionando el booleano directamente, si cambia.
  // ============================================
  const inCart = useCartStore((state) => state.items.some((i) => i.id === id));
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleToggleCart = (): void => {
    if (inCart) {
      removeItem(id);
    } else {
      addItem(item);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{category}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Instructor</Text>
        <Text style={styles.fieldValue}>{instructor}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Precio</Text>
        <Text style={styles.fieldValue}>${price.toLocaleString()}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Duración</Text>
        <Text style={styles.fieldValue}>{duration}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Nivel</Text>
        <Text style={styles.fieldValue}>{level}</Text>
      </View>

      {/* ============================================ */}
      {/* BOTÓN CARRITO — conectado al store Zustand    */}
      {/* Al tocarlo aquí, el badge de la tab "Carrito"  */}
      {/* se actualiza solo, sin pasar props ni callbacks */}
      {/* entre pantallas.                                */}
      {/* ============================================ */}
      <Pressable
        style={({ pressed }) => [
          styles.cartButton,
          inCart && styles.cartButtonActive,
          pressed && styles.cartButtonPressed,
          !available && styles.cartButtonDisabled,
        ]}
        onPress={handleToggleCart}
        disabled={!available}
        testID="cart-button"
      >
        <Text style={[styles.cartButtonText, inCart && styles.cartButtonTextActive]}>
          {!available
            ? 'No disponible'
            : inCart
              ? '✓ En el carrito — quitar'
              : '＋ Agregar al carrito'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    gap: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.accent,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  field: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
  },
  cartButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cartButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  cartButtonPressed: {
    opacity: 0.7,
  },
  cartButtonDisabled: {
    opacity: 0.4,
  },
  cartButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textPrimary,
  },
  cartButtonTextActive: {
    color: COLORS.background,
  },
});
