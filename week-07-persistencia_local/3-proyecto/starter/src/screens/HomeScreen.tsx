import React, { useEffect, useMemo, useState } from 'react';
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
import { usePreferences } from '../hooks/usePreferences';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { Item } from '../types';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data, isLoading, isError, isFetching, error, refetch } = useItems();

  // Preferencias guardadas con MMKV — cambian en Ajustes y esta pantalla
  // se actualiza sola (los hooks de MMKV son reactivos).
  const { sortBy, sortOrder, compactMode, itemsPerPage } = usePreferences();

  // Cuántas "páginas" de cursos se están mostrando (botón "Ver más").
  const [pages, setPages] = useState(1);
  useEffect(() => {
    setPages(1);
  }, [itemsPerPage]);

  const items = data?.items;

  // Aplica la preferencia de orden. useMemo evita reordenar en cada
  // render — solo cuando cambian la lista o las preferencias.
  const sortedItems = useMemo(() => {
    const copy = [...(items ?? [])];
    copy.sort((a, b) => a[sortBy].localeCompare(b[sortBy], 'es'));
    return sortOrder === 'desc' ? copy.reverse() : copy;
  }, [items, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando cursos…</Text>
      </View>
    );
  }

  // Solo llegamos aquí si falló la red Y no había caché guardada.
  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No se pudo cargar la lista</Text>
        <Text style={styles.errorDetail}>Sin conexión y sin datos guardados todavía.</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const visibleItems = sortedItems.slice(0, itemsPerPage * pages);
  const hasMore = visibleItems.length < sortedItems.length;
  const isOffline = data?.source === 'cache';

  function renderItem({ item }: { item: Item }): React.JSX.Element {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          compactMode && styles.cardCompact,
          pressed && styles.cardPressed,
        ]}
        onPress={() => navigation.navigate('Edit', { id: item.id, name: item.name })}
        testID={`item-${item.id}`}
      >
        {!compactMode && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          {/* En modo compacto solo se ve el nombre del curso */}
          {!compactMode && (
            <>
              <Text style={styles.instructor}>👤 {item.instructor}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.chevron}>{'›'}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner} testID="offline-banner">
          <Text style={styles.offlineTitle}>⚠️ Mostrando datos sin red</Text>
          {data?.cachedAt !== undefined && (
            <Text style={styles.offlineDetail}>
              Última copia guardada: {new Date(data.cachedAt).toLocaleString('es-CO')}
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={compactMode ? styles.separatorCompact : styles.separator} />}
        onRefresh={() => refetch()}
        refreshing={isFetching && !isLoading}
        ListHeaderComponent={
          <Text style={styles.countLabel}>
            Mostrando {visibleItems.length} de {sortedItems.length} cursos · toca uno para editarlo
          </Text>
        }
        ListFooterComponent={
          hasMore ? (
            <Pressable
              style={styles.moreButton}
              onPress={() => setPages((current) => current + 1)}
              testID="more-button"
            >
              <Text style={styles.moreButtonText}>Ver más</Text>
            </Pressable>
          ) : null
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
  offlineBanner: {
    backgroundColor: COLORS.warning + '26',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    gap: 2,
  },
  offlineTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.warning,
  },
  offlineDetail: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
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
  cardCompact: {
    paddingVertical: SPACING.sm,
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
  separatorCompact: {
    height: SPACING.xs,
  },
  moreButton: {
    marginTop: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.accent,
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
