<script setup lang="ts">
import PosItem from '~/components/pos/PosItem.vue'
import CartSidebar from '~/components/pos/CartSidebar.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const posStore = usePosStore()
const { categories, menus, cart, cartTotal } = storeToRefs(posStore)
const toast = useToast()

const selectedCategoryId = ref<number | null>(null)
const searchQuery = ref('')
const checkoutModal = ref(false)
const receiptData = ref<any>(null)

const filteredMenus = computed(() => {
  let result = menus.value
  
  if (selectedCategoryId.value !== null) {
    result = result.filter(m => m.categoryId === selectedCategoryId.value)
  }
  
  if (searchQuery.value) {
    result = result.filter(m => 
      m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return result
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const handleCheckout = async (paymentDetails: any) => {
  if (cartTotal.value === 0) return
  
  try {
    if (paymentDetails.method === 'transfer') {
      const response = await $fetch<any>('/api/payment/midtrans', {
        method: 'POST',
        body: {
          amount: cartTotal.value,
          items: cart.value
        }
      })
      
      if (response.status === 'success' && response.data.token) {
        // Use Midtrans Snap SDK for popup
        if ((window as any).snap) {
          (window as any).snap.pay(response.data.token, {
            onSuccess: (result: any) => {
              completeOrder({
                ...paymentDetails,
                method: 'transfer',
                amountPaid: cartTotal.value,
                change: 0
              })
            },
            onPending: (result: any) => {
              toast.add({
                title: 'Payment Pending',
                description: 'Please complete your payment.',
                color: 'warning'
              })
            },
            onError: (result: any) => {
              toast.add({
                title: 'Payment Failed',
                description: 'Something went wrong with the payment.',
                color: 'error'
              })
            },
            onClose: () => {
              toast.add({
                title: 'Payment Closed',
                description: 'You closed the payment popup.',
                color: 'neutral'
              })
            }
          })
        } else {
          // Fallback to redirect if snap.js is not loaded
          window.open(response.data.redirect_url, '_blank')
        }
      }
    } else {
      completeOrder(paymentDetails)
    }
  } catch (error) {
    console.error('Payment error:', error)
    toast.add({
      title: 'Payment Error',
      description: 'Failed to process payment. Please try again.',
      color: 'error'
    })
  }
}

const completeOrder = (paymentDetails: any) => {
  receiptData.value = {
    transactionId: 'TRX-' + Date.now(),
    date: new Date().toLocaleString('id-ID'),
    items: [...cart.value],
    total: cartTotal.value,
    paymentMethod: paymentDetails.method,
    amountPaid: paymentDetails.amountPaid,
    change: paymentDetails.change
  }
  
  // Save to report
  const savedReports = JSON.parse(localStorage.getItem('report') || '[]')
  savedReports.push({
    ...receiptData.value,
    created_at: new Date().toISOString()
  })
  localStorage.setItem('report', JSON.stringify(savedReports))

  // Update stock
  const updatedMenus = menus.value.map(menu => {
    const cartItem = cart.value.find(c => c.id === menu.id)
    if (cartItem) {
      return { ...menu, stock: menu.stock - cartItem.quantity }
    }
    return menu
  })
  menus.value = updatedMenus
  localStorage.setItem('pos_menus', JSON.stringify(updatedMenus))

  checkoutModal.value = true
  posStore.clearCart()
  
  toast.add({
    title: 'Order Completed',
    description: 'Transaction has been successfully recorded.',
    color: 'success'
  })
}

const printReceipt = () => {
  if (!receiptData.value) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <html>
      <head>
        <title>Receipt - ${receiptData.value.transactionId}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; }
          .bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0;">CASHSIR POS</h2>
          <p style="margin: 5px 0;">Jl. Contoh No. 123, Jakarta</p>
          <p>021-12345678</p>
        </div>
        <div class="divider"></div>
        <div>
          <p>ID: ${receiptData.value.transactionId}</p>
          <p>Date: ${receiptData.value.date}</p>
          <p>Cashier: Admin</p>
        </div>
        <div class="divider"></div>
        <table>
          ${receiptData.value.items.map((item: any) => `
            <tr>
              <td colspan="3">${item.name}</td>
            </tr>
            <tr>
              <td>${item.quantity} x ${item.price.toLocaleString('id-ID')}</td>
              <td class="text-right">${(item.quantity * item.price).toLocaleString('id-ID')}</td>
            </tr>
          `).join('')}
        </table>
        <div class="divider"></div>
        <div class="flex">
          <span>Total</span>
          <span class="bold">Rp ${receiptData.value.total.toLocaleString('id-ID')}</span>
        </div>
        <div class="flex">
          <span>Method</span>
          <span>${receiptData.value.paymentMethod.toUpperCase()}</span>
        </div>
        ${receiptData.value.paymentMethod === 'cash' ? `
          <div class="flex">
            <span>Paid</span>
            <span>Rp ${receiptData.value.amountPaid.toLocaleString('id-ID')}</span>
          </div>
          <div class="flex">
            <span>Change</span>
            <span>Rp ${receiptData.value.change.toLocaleString('id-ID')}</span>
          </div>
        ` : ''}
        <div class="divider"></div>
        <div class="center" style="margin-top: 20px;">
          <p>THANK YOU FOR YOUR VISIT!</p>
          <p>Please come again</p>
        </div>
      </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}
</script>

<template>
  <div class="flex h-[calc(100vh-6rem)] gap-6 -mt-2">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="mb-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Menu Selection
          </h1>
          <div class="w-full sm:w-64">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search dishes..."
              size="md"
              variant="subtle"
              class="w-full"
            />
          </div>
        </div>

        <!-- Categories -->
        <div class="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
          <UButton
            label="All Items"
            icon="i-heroicons-squares-2x2"
            :variant="selectedCategoryId === null ? 'solid' : 'soft'"
            color="primary"
            class="rounded-full px-4 shrink-0"
            @click="selectedCategoryId = null"
          />
          <UButton
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :icon="cat.icon"
            :variant="selectedCategoryId === cat.id ? 'solid' : 'soft'"
            color="primary"
            class="rounded-full px-4 shrink-0 transition-all"
            @click="selectedCategoryId = cat.id"
          />
        </div>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 overflow-y-auto pr-2 pb-6">
        <div v-if="filteredMenus.length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <PosItem
            v-for="item in filteredMenus"
            :key="item.id"
            :item="item"
            @add="posStore.addToCart"
          />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
          <UIcon name="i-heroicons-no-symbol" class="h-12 w-12 mb-2" />
          <p class="text-lg">No items found</p>
          <UButton 
            v-if="searchQuery || selectedCategoryId" 
            label="Clear filters" 
            variant="link" 
            @click="searchQuery = ''; selectedCategoryId = null" 
          />
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-96 flex-shrink-0 hidden lg:block">
      <CartSidebar @checkout="handleCheckout" />
    </div>

    <!-- Receipt Modal -->
    <UModal v-model:open="checkoutModal" title="Transaction Receipt" :dismissible="false">
      <template #content>
        <UCard v-if="receiptData" class="max-w-md w-full mx-auto overflow-hidden">
          <template #header>
            <div class="text-center">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Receipt</h3>
              <p class="text-xs text-gray-500 mt-1">{{ receiptData.transactionId }}</p>
            </div>
          </template>

          <div class="space-y-4">
            <div class="text-center space-y-1">
              <h4 class="text-xl font-bold">CASHSIR POS</h4>
              <p class="text-xs text-gray-500">Jakarta, Indonesia</p>
              <p class="text-xs text-gray-500">{{ receiptData.date }}</p>
            </div>

            <div class="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div v-for="item in receiptData.items" :key="item.id" class="flex justify-between items-start mb-2">
                <div class="flex-1 pr-4">
                  <p class="text-sm font-medium">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
                </div>
                <p class="text-sm font-bold">{{ formatCurrency(item.price * item.quantity) }}</p>
              </div>
            </div>

            <div class="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div class="flex justify-between items-center text-base font-black">
                <span>Grand Total</span>
                <span>{{ formatCurrency(receiptData.total) }}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-gray-500 capitalize">
                <span>Payment Method</span>
                <span>{{ receiptData.paymentMethod }}</span>
              </div>
              <template v-if="receiptData.paymentMethod === 'cash'">
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>Amount Paid</span>
                  <span>{{ formatCurrency(receiptData.amountPaid) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm font-bold text-green-600">
                  <span>Change</span>
                  <span>{{ formatCurrency(receiptData.change) }}</span>
                </div>
              </template>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
              <p class="text-xs italic text-gray-500">Thank you for shopping with us!</p>
            </div>
          </div>

          <template #footer>
            <div class="grid grid-cols-2 gap-3">
              <UButton
                icon="i-heroicons-printer"
                label="Print"
                color="primary"
                @click="printReceipt"
              />
              <UButton
                label="Close"
                color="neutral"
                variant="outline"
                @click="checkoutModal = false"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
