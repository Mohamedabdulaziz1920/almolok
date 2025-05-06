import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, OrderItem } from '@/types'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  totalPrice: 0,
  paymentMethod: undefined,
  balance: 0, // ✅ تمت إضافته هنا
}

interface CartState {
  cart: Cart
  addItem: (item: OrderItem, quantity: number) => string
  updateItem: (item: OrderItem, quantity: number) => void
  removeItem: (item: OrderItem) => void
  clearCart: () => void
  setPaymentMethod: (paymentMethod: string) => void
  setBalance: (balance: number) => void // ✅ تمت إضافته هنا
  init: () => void
}

const calculatePrices = (items: OrderItem[]) => {
  const itemsPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  return {
    itemsPrice,
    totalPrice: itemsPrice,
  }
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: (item: OrderItem, quantity: number) => {
        if (!item.playerId || !/^[a-zA-Z0-9]+$/.test(item.playerId)) {
          throw new Error('Player ID must contain only letters and numbers')
        }

        if (Number(item.playerId) <= 0) {
          throw new Error('Player ID must be positive')
        }

        const { items } = get().cart

        const existItem = items.find(
          (x) => x.product === item.product && x.playerId === item.playerId
        )

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error('Not enough items in stock')
          }
        } else {
          if (item.countInStock < quantity) {
            throw new Error('Not enough items in stock')
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product && x.playerId === item.playerId
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }]

        const prices = calculatePrices(updatedCartItems)

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...prices,
          },
        })

        const foundItem = updatedCartItems.find(
          (x) => x.product === item.product && x.playerId === item.playerId
        )

        if (!foundItem) {
          throw new Error('Item not found in cart')
        }

        return foundItem.clientId
      },

      updateItem: (item: OrderItem, quantity: number) => {
        const { items } = get().cart

        const exist = items.find(
          (x) => x.product === item.product && x.playerId === item.playerId
        )

        if (!exist) return

        const updatedCartItems = items.map((x) =>
          x.product === item.product && x.playerId === item.playerId
            ? { ...exist, quantity }
            : x
        )

        const prices = calculatePrices(updatedCartItems)

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...prices,
          },
        })
      },

      removeItem: (item: OrderItem) => {
        const { items } = get().cart

        const updatedCartItems = items.filter(
          (x) => x.product !== item.product || x.playerId !== item.playerId
        )

        const prices = calculatePrices(updatedCartItems)

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...prices,
          },
        })
      },

      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        })
      },

      setBalance: (balance: number) => {
        set({
          cart: {
            ...get().cart,
            balance,
          },
        })
      },

      clearCart: () => {
        set({
          cart: {
            ...get().cart,
            items: [],
            itemsPrice: 0,
            totalPrice: 0,
            balance: 0, // ✅ إعادة تعيين الرصيد أيضًا
          },
        })
      },

      init: () => set({ cart: initialState }),
    }),
    {
      name: 'cart-store',
    }
  )
)

export default useCartStore
