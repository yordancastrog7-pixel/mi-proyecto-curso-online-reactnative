// ============================================================
// COMPONENT: ItemCard
// ============================================================
// Tarjeta reutilizable para mostrar un curso de la plataforma.
// Se renderiza una vez por cada item en HomeScreen.
// ============================================================
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Course } from '../types';

interface ItemCardProps {
  item: Course;
  onPress: (item: Course) => void;
}

export function ItemCard({ item, onPress }: ItemCardProps): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(item)}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <View style={styles.cardFooterRow}>
          <Text style={styles.cardInstructor}>👤 {item.instructor}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flexShrink: 1,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#58a6ff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8b949e',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardInstructor: {
    fontSize: 13,
    color: '#c9d1d9',
  },
  categoryBadge: {
    backgroundColor: '#1f6feb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
});