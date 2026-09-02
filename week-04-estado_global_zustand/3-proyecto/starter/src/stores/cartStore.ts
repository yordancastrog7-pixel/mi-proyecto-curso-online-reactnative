import { create } from 'zustand';
import type { Item } from '../types';

// ============================================
// CART STORE — Semana 04
// Estado global del carrito de cursos, compartido entre HomeScreen,
// DetailScreen y CartScreen sin pasar props ni callbacks (sin
// "prop drilling"). Cualquier componente que lo importe ve los
// mismos datos, y se re-renderiza solo si el pedazo de estado que
// selecciona realmente cambió.
// ============================================
interface CartStore {
  items: Item[];

  // Agrega un curso al carrito. No duplica si ya estaba.
  addItem: (item: Item) => void;

  // Quita un curso del carrito por id.
  removeItem: (id: string) => void;

  // Vacía el carrito completo.
  clearAll: () => void;

  // Helper: ¿este curso ya está en el carrito?
  // Se usa en DetailScreen para decidir si el botón dice
  // "Agregar al carrito" o "Quitar del carrito".
  isItemInCart: (id: string) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const alreadyInCart = get().items.some((i) => i.id === item.id);
    if (alreadyInCart) return;
    set((state) => ({ items: [...state.items, item] }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clearAll: () => {
    set({ items: [] });
  },

  isItemInCart: (id) => {
    return get().items.some((i) => i.id === id);
  },
}));
