export interface Category {
  id: number
  name: string
  icon: string
}

export interface Menu {
  id: number
  categoryId: number
  name: string
  price: number
  stock: number
}

export interface CartItem extends Menu {
  quantity: number
}

export const usePosStore = defineStore('pos', () => {
  const categories = ref<Category[]>([
    { id: 1, name: 'Food', icon: 'ion:fast-food' },
    { id: 2, name: 'Drink', icon: 'ion:beer' },
    { id: 3, name: 'Snack', icon: 'ion:ice-cream' },
  ])

  const menus = ref<Menu[]>([
    { id: 1, categoryId: 1, name: 'Nasi Goreng Special', price: 25000, stock: 10 },
    { id: 2, categoryId: 1, name: 'Mie Goreng Seafood', price: 28000, stock: 8 },
    { id: 3, categoryId: 2, name: 'Es Teh Manis', price: 5000, stock: 50 },
    { id: 4, categoryId: 2, name: 'Kopi Susu Gula Aren', price: 15000, stock: 20 },
  ])

  const cart = ref<CartItem[]>([])

  // Load from localStorage on init
  onMounted(() => {
    const savedCategories = localStorage.getItem('pos_categories')
    if (savedCategories) categories.value = JSON.parse(savedCategories)

    const savedMenus = localStorage.getItem('pos_menus')
    if (savedMenus) menus.value = JSON.parse(savedMenus)
  })

  // Watch for changes and save to localStorage
  watch([categories, menus], () => {
    localStorage.setItem('pos_categories', JSON.stringify(categories.value))
    localStorage.setItem('pos_menus', JSON.stringify(menus.value))
  }, { deep: true })

  const addToCart = (product: Menu) => {
    const item = cart.value.find((i) => i.id === product.id)
    if (item) {
      item.quantity++
    } else {
      cart.value.push({ ...product, quantity: 1 })
    }
  }

  const removeFromCart = (productId: number) => {
    const index = cart.value.findIndex((i) => i.id === productId)
    if (index !== -1) {
      if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
      } else {
        cart.value.splice(index, 1)
      }
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  return {
    categories,
    menus,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
  }
})
