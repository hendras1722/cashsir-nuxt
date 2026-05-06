<script setup lang="ts">
const posStore = usePosStore()
const { cart, cartTotal, amountPaid } = storeToRefs(posStore)

const paymentMethod = ref('cash')
const selectedBank = ref({ label: 'QRIS (Recommended)', value: 'qris', icon: 'i-heroicons-qr-code' })

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const change = computed(() => {
  const paid = Number(amountPaid.value) || 0
  const total = Number(cartTotal.value) || 0
  return paid - total
})

const emit = defineEmits(['checkout'])

const isCash = computed(() => {
  if (typeof paymentMethod.value === 'number') return paymentMethod.value === 0
  if (typeof paymentMethod.value === 'string') return paymentMethod.value === 'cash' || paymentMethod.value === '0'
  return (paymentMethod.value as any)?.value === 'cash'
})

const handleCheckout = () => {
  const method = isCash.value ? 'cash' : 'transfer'

  if (method === 'cash' && amountPaid.value < cartTotal.value) {
    return
  }

  emit('checkout', {
    method: method,
    amountPaid: amountPaid.value,
    change: change.value,
    bank: !isCash.value ? (selectedBank.value?.value || selectedBank.value) : null
  })
}
</script>

<template>
  <div class="flex h-full flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
    <div class="p-6 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-xl font-bold">Current Order</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
        <UIcon name="ion:cart-outline" class="h-16 w-16 mb-2" />
        <p>Your cart is empty</p>
      </div>

      <div v-for="item in cart" :key="item.id" class="flex items-center justify-between group">
        <div class="flex-1">
          <h4 class="font-medium text-sm">{{ item.name }}</h4>
          <p class="text-xs text-gray-500">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton icon="i-heroicons-minus" size="xs" color="neutral" variant="ghost"
            @click="posStore.removeFromCart(item.id)" />
          <span class="text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
          <UButton icon="i-heroicons-plus" size="xs" color="neutral" variant="ghost"
            @click="posStore.addToCart(item)" />
        </div>
      </div>
    </div>

    <div class="p-6 border-t border-gray-200 dark:border-gray-800 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      <div class="space-y-3">
        <div class="flex justify-between items-center text-sm font-medium text-gray-500">
          <span>Payment Method</span>
        </div>
        <UTabs v-model="paymentMethod" :items="[
          { label: 'Cash', value: 'cash', icon: 'i-heroicons-banknotes' },
          { label: 'Transfer', value: 'transfer', icon: 'i-heroicons-credit-card' }
        ]" class="w-full" />

        <div v-if="!isCash" class="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="text-xs font-bold text-gray-500 uppercase">Select Payment Method</div>
          <USelectMenu v-model="selectedBank" :items="[
            { label: 'QRIS (Recommended)', value: 'qris' },
            { label: 'BCA Virtual Account', value: 'bca' },
            { label: 'Mandiri Bill', value: 'echannel' },
            { label: 'BNI Virtual Account', value: 'bni' },
            { label: 'BRI Virtual Account', value: 'bri' }
          ]" class="w-full" placeholder="Choose Payment" size="lg" />
        </div>

        <div v-if="isCash" class="space-y-2 pt-2">
          <div class="flex justify-between items-center text-sm">
            <span>Amount Paid</span>
          </div>
          <UInput v-model="amountPaid" type="number" icon="i-heroicons-banknotes" placeholder="0" size="lg"
            class="w-full font-bold" />
          <div class="flex justify-between items-center text-sm font-bold p-2 rounded transition-colors"
            :class="change >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'">
            <span>{{ change >= 0 ? 'Change' : 'Remaining' }}</span>
            <span>{{ formatCurrency(Math.abs(change)) }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>

      <div class="flex justify-between items-center text-lg font-bold">
        <span>Total</span>
        <span class="text-primary-600">{{ formatCurrency(cartTotal) }}</span>
      </div>

      <UButton block size="lg" color="primary"
        :disabled="cart.length === 0 || (paymentMethod === 'cash' && amountPaid < cartTotal)" @click="handleCheckout">
        Confirm & Pay
      </UButton>

      <UButton block size="sm" color="neutral" variant="ghost" :disabled="cart.length === 0"
        @click="posStore.clearCart">
        Clear Order
      </UButton>
    </div>
  </div>
</template>
