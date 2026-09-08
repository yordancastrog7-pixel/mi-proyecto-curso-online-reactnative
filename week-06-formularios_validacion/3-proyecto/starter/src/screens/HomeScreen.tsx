import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useItems } from '../hooks/useItems';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { Item } from '../types';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data, isLoading, isError, isFetching, error, refetch } = useItems();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando cursos…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No se pudo cargar la lista</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const items = data ?? [];

  function renderItem({ item }: { item: Item }): React.JSX.Element {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate('Edit', { id: item.id, name: item.name })}
        testID={`item-${item.id}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.instructor}>👤 {item.instructor}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Text style={styles.chevron}>{'›'}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={() => refetch()}
        refreshing={isFetching && !isLoading}
        ListHeaderComponent={
          <Text style={styles.countLabel}>
            {items.length} curso{items.length !== 1 ? 's' : ''} · toca uno para editarlo
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No hay cursos disponibles.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.base,
    flexGrow: 1,
  },
  countLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceAlt,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.accent,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textPrimary,
  },
  instructor: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  chevron: {
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.textMuted,
  },
  separator: {
    height: SPACING.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.error,
  },
  errorDetail: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.background,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
