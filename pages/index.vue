<template>
  <div class="min-h-screen p-5">
    <div class="flex justify-center">
      <h1 class="text-2xl font-bold">Cashier Apps</h1>
    </div>
    <USeparator class="my-5" />


    <u-table id="table" :data="data" :columns="columns">
      <template #quantity-cell="{ row }">
        <span class="mx-2">{{ row.original.quantity }}</span>
      </template>
      <template #price-cell="{ row }">
        <span>Rp.{{ Number(row.original.price).toLocaleString('id-ID') }}</span>
      </template>
      <template #subtotal-cell="{ row }">
        <span>Rp.{{ Number(Number(row.original.price) * row.original.quantity).toLocaleString('id-ID') }}</span>
      </template>
      <!-- <template #action-cell="{ row }">
        <UButton icon="i-lucide-trash" color="error" variant="ghost" aria-label="Delete"
          @click="removeItem(row.original.id)" />
      </template> -->
    </u-table>


    <div class="flex justify-end mt-4 font-bold text-lg">
      <div class="flex flex-col gap-4 w-full max-w-xs">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Amount Paid</span>
            <span class="font-bold">Rp.{{ Number(posStore.amountPaid).toLocaleString('id-ID') }}</span>
          </div>
          <div
            class="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded flex justify-between">
            <span>Change</span>
            <span>Rp.{{ Math.max(0, posStore.amountPaid - Number(getTotalList)).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center text-xl border-t pt-4">
          <span>Total</span>
          <span>Rp.{{ Number(getTotalList).toLocaleString('id-ID') }}</span>
        </div>
      </div>
    </div>

    <!-- Midtrans Payment Info Modal (Mirrors Snap UI) -->
    <div v-if="posStore.pendingPayment"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Header -->
        <div class="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <span class="font-bold text-gray-800 dark:text-white uppercase tracking-wider">MSA</span>
          <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="posStore.pendingPayment = null" />
        </div>

        <div class="p-6 space-y-6">
          <!-- Amount & Order ID -->
          <div class="text-center space-y-2">
            <div class="flex items-center justify-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
              <span>{{ formatCurrency(posStore.pendingPayment.gross_amount || getTotalList) }}</span>
              <UButton icon="i-heroicons-document-duplicate" size="xs" color="primary" variant="ghost"
                @click="() => { navigator.clipboard.writeText(String(posStore.pendingPayment.gross_amount)); toast.add({ title: 'Amount Copied', color: 'success' }) }" />
            </div>
            <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-medium">Order ID #{{
                posStore.pendingPayment.order_id }}</span>
              <UButton icon="i-heroicons-document-duplicate" size="xs" color="neutral" variant="ghost"
                @click="() => { navigator.clipboard.writeText(posStore.pendingPayment.order_id); toast.add({ title: 'Order ID Copied', color: 'success' }) }" />
            </div>
          </div>

          <!-- Timer Simulation -->
          <div class="bg-red-50 dark:bg-red-900/10 text-red-600 p-2 rounded text-center text-xs font-medium">
            Pay within <span class="font-bold tabular-nums">23:59:59</span>
          </div>

          <!-- Bank Info -->
          <div v-if="posStore.pendingPayment.va_numbers?.[0]" class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">Bank {{ posStore.pendingPayment.va_numbers[0].bank.toUpperCase() }}</span>
              <div
                class="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-black text-gray-400">
                {{ posStore.pendingPayment.va_numbers[0].bank.toUpperCase() }}
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Complete payment from {{ posStore.pendingPayment.va_numbers[0].bank.toUpperCase() }} to the virtual
              account
              number below.
            </p>

            <div class="space-y-1">
              <div class="text-xs text-gray-400 font-medium">Virtual account number</div>
              <div
                class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <span class="text-xl font-black tracking-widest text-primary-600">{{
                  posStore.pendingPayment.va_numbers[0].va_number }}</span>
                <UButton label="Copy" icon="i-heroicons-clipboard-document" color="primary" variant="soft" size="sm"
                  @click="() => { navigator.clipboard.writeText(posStore.pendingPayment.va_numbers[0].va_number); toast.add({ title: 'VA Copied', color: 'success' }) }" />
              </div>
            </div>
          </div>

          <!-- QRIS Info -->
          <div v-if="posStore.pendingPayment.payment_type === 'qris'" class="space-y-4 flex flex-col items-center">
            <div class="text-lg font-bold">QRIS</div>
            <div class="bg-white p-4 rounded-xl shadow-inner border">
              <img :src="posStore.pendingPayment.actions?.find(a => a.name === 'generate-qr-code')?.url" alt="QRIS Code"
                class="w-48 h-48" />
            </div>
            <p class="text-sm text-center text-gray-500">Scan QR code above with any payment app</p>
          </div>

          <!-- GOPAY/E-Wallets -->
          <div
            v-else-if="posStore.pendingPayment.payment_type === 'gopay' || posStore.pendingPayment.payment_type === 'shopeepay'"
            class="space-y-4 flex flex-col items-center">
            <div class="text-lg font-bold uppercase">{{ posStore.pendingPayment.payment_type }}</div>
            <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl text-center">
              <p class="text-sm text-primary-600 font-medium">Please open your {{ posStore.pendingPayment.payment_type
                }}
                app to complete payment.</p>
            </div>
            <UButton v-if="posStore.pendingPayment.actions?.find(a => a.name === 'deeplink-redirect')" label="Open App"
              :to="posStore.pendingPayment.actions?.find(a => a.name === 'deeplink-redirect')?.url" target="_blank"
              block color="primary" />
          </div>

          <!-- Payment Code (Retail) -->
          <div v-else-if="posStore.pendingPayment.payment_code" class="space-y-4">
            <div class="text-lg font-bold uppercase">{{ posStore.pendingPayment.payment_type.replace('_', ' ') }}</div>
            <div class="space-y-1">
              <div class="text-xs text-gray-400 font-medium">Payment Code</div>
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                <span class="text-xl font-black tracking-widest text-primary-600">{{
                  posStore.pendingPayment.payment_code
                  }}</span>
                <UButton label="Copy" icon="i-heroicons-clipboard-document" color="primary" variant="soft" size="sm"
                  @click="() => { navigator.clipboard.writeText(posStore.pendingPayment.payment_code); toast.add({ title: 'Code Copied', color: 'success' }) }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 pt-0 space-y-2">
          <UButton label="Check payment status" block size="lg" color="primary" class="font-bold py-4"
            :loading="checkingStatus" @click="checkPaymentStatus" />
          <UButton label="Cancel / Close" block variant="ghost" color="neutral"
            @click="posStore.pendingPayment = null" />
        </div>
      </div>
    </div>

    <UModal v-model:open="checkoutOpen" title="Checkout - Receipt" :dismissible="false" :close="false">
      <template #body>
        <div class="w-full">
          <div class="text-center mb-4">
            <h3 class="text-lg font-bold">RECEIPT PEMBELIAN</h3>
          </div>

          <div class="mb-4 text-sm">
            <div>ID: TRX-{{ Date.now() }}</div>
            <div>Tanggal: {{ new Date().toLocaleString('id-ID') }}</div>
          </div>

          <!-- Divider -->
          <div class="border-2 border-black w-full border-dashed my-4"></div>

          <!-- Items List -->
          <div class="space-y-2 text-sm">
            <div class="grid grid-cols-4 gap-2 font-bold text-xs">
              <div>Nama Produk</div>
              <div class="text-center">Qty</div>
              <div class="text-right">Harga</div>
              <div class="text-right">Subtotal</div>
            </div>

            <template v-for="item in data" :key="item.id">
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div class="truncate">{{ item.name }}</div>
                <div class="text-center">{{ item.quantity }}x</div>
                <div class="text-right">Rp.{{ Number(item.price).toLocaleString('id-ID') }}</div>
                <div class="text-right">Rp.{{ Number(item.subtotal).toLocaleString('id-ID') }}</div>
              </div>
            </template>
          </div>

          <div class="border-t-2 border-dashed border-black mt-4 pt-2">
            <div class="flex justify-between font-bold">
              <span>DARI CUSTOMER:</span>
              <span>Rp.{{ Number(posStore.amountPaid).toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>TOTAL HARGA:</span>
              <span>Rp.{{ Number(getTotalList).toLocaleString('id-ID') }}</span>
            </div>
            <!-- Divider -->
            <div class="border-2 border-black w-full border-dashed my-4"></div>

            <div class="flex justify-between font-bold">
              <span>KEMBALI:</span>
              <span>Rp.{{ Math.max(0, posStore.amountPaid - Number(getTotalList)).toLocaleString('id-ID') }}</span>
            </div>

          </div>

          <div class="flex justify-around gap-3 mt-6">
            <UButton color="success" variant="solid" class="flex-1 justify-center" @click="printReceipt">
              <template #leading>
                <i class="i-lucide-printer"></i>
              </template>
              Print Receipt
            </UButton>

            <UButton color="primary" variant="solid" class="flex-1 justify-center" @click="downloadReceipt">
              <template #leading>
                <i class="i-lucide-download"></i>
              </template>
              Download
            </UButton>
          </div>

          <!-- Clear Cart Button -->
          <div class="mt-4">
            <UButton color="neutral" variant="outline" class="w-full justify-center" @click="clearCartAndClose">
              <template #leading>
                <i class="i-lucide-trash-2"></i>
              </template>
              Clear Cart & Close
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Thank You Modal -->
    <UModal v-model:open="showThankYou" prevent-close :close="false">
      <template #body>
        <UCard>
          <div class="p-8 text-center space-y-4">
            <div
              class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-600" />
            </div>
            <h2 class="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-wider">Terima Kasih!</h2>
            <p class="text-gray-500 font-medium">Pembayaran Anda telah berhasil.</p>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { UButton, UModal, USelectMenu } from '#components'
import type { TableColumn, FormSubmitEvent } from '@nuxt/ui'
import { addDays, startOfDay } from 'date-fns'
import * as z from 'zod'
import InputCurrency from '~/components/InputCurrency.vue'
import { useWindowSize } from '@vueuse/core'


useHead({
  title: 'Cashsir App',
})

definePageMeta({
  layout: false,
  name: 'CashsirApp',

})
const { width } = useWindowSize()

const schema = z.object({
  product_name: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    stock: z.number()
  }),
  quantity: z.number().refine((value) => {
    const getProductList = getProduct.value.find(item => item.id === state.product_name?.id)
    if (Number(value) > Number((getProductList)?.stock)) return false
    if (Number(value) <= 0) return false
    return true
  },
    { message: 'Quantity must be greater than 0 and less than or equal to stock' })
})

type Schema = z.output<typeof schema>

interface TableList {
  id: number
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}


const posStore = usePosStore()

const open = ref<boolean>(false)
const checkoutOpen = ref<boolean>(false)
const showThankYou = ref<boolean>(false)
const checkingStatus = ref(false)
const statusInterval = ref<any>(null)

const isCash = computed(() => true)



const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const state = reactive<Partial<Schema>>({
  product_name: {
    id: 0,
    name: '',
    price: 0,
    stock: 0
  },
  quantity: 1
})

const data = ref<TableList[]>([])
const toast = useToast()

watch(() => posStore.cart, (newCart) => {
  data.value = newCart.map((item: any) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity
  }))
}, { deep: true, immediate: true })

const columns: TableColumn<TableList>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
  },
  {
    accessorKey: 'price',
    header: 'Harga'
  },
  {
    accessorKey: 'subtotal',
    header: 'Subtotal',
  },
]

const product = ref<Product[]>([])

const getProduct = computed(() => product.value.map((item: Product) => {
  return {
    ...item,
    label: item.name,
    value: item.id
  }
}).filter((item: any) => item.stock > 0 && data.value.filter(product => product.id === item.id).length === 0) as Product[])

function handleCount(type: 'min' | 'plus', id: number) {
  const item = product.value.find(p => p.id === id)
  if (!item) return
  if (type === 'plus') {
    posStore.addToCart(item as any)
  } else {
    posStore.removeFromCart(id)
  }
}

function removeItem(id: number) {
  posStore.deleteFromCart(id)
  toast.add({
    title: 'Success',
    description: 'Item berhasil dihapus',
    color: 'success'
  })
}

const getTotalList = computed(() => {
  return data.value.reduce((total, item) => {
    return total + item.subtotal
  }, 0)
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Submit Success', event.data)
  toast.add({ title: 'Success', description: 'Item berhasil ditambahkan ke order', color: 'success' })

  const productData = event.data.product_name
  const quantity = event.data.quantity

  for (let i = 0; i < quantity; i++) {
    posStore.addToCart({
      id: productData.id,
      categoryId: 0,
      name: productData.name,
      price: productData.price,
      stock: productData.stock
    })
  }

  open.value = false

  // Reset form
  state.product_name = {
    id: 0,
    name: '',
    price: 0,
    stock: 0
  }
  state.quantity = 1
}

function onError(event: any) {
  console.error('Validation Error:', event.errors)
  toast.add({ title: 'Validation Error', description: 'Please check your input', color: 'error' })
}

const getTotal = computed(() => {
  const getPrice = getProduct.value.find(item => item.id === state.product_name?.id) as Product
  return {
    price: getPrice?.price,
    subtotal: getPrice && Number(getPrice?.price || 0) * (state.quantity || 0)
  }
})

function generateReceiptContent() {
  const currentDate = new Date().toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const receiptId = `TRX-${Date.now()}`

  let receiptContent = `
=================================
         RECEIPT PEMBELIAN
=================================
ID: ${receiptId}
Tanggal: ${currentDate}
=================================

`

  data.value.forEach(item => {
    const itemName = item.name.padEnd(15)
    const qty = `${item.quantity}x`.padStart(5)
    const price = `Rp.${Number(item.price).toLocaleString('id-ID')}`.padStart(12)
    const subtotal = `Rp.${Number(item.subtotal).toLocaleString('id-ID')}`.padStart(12)

    receiptContent += `${itemName} ${qty} ${price} ${subtotal}\n`
  })

  receiptContent += `
=================================
Dari Customer: Rp.${Number(posStore.amountPaid).toLocaleString('id-ID')}
TOTAL Harga: Rp.${Number(getTotalList.value).toLocaleString('id-ID')}
=================================
KEMBALI: Rp.${Math.max(0, posStore.amountPaid - Number(getTotalList.value)).toLocaleString('id-ID')}
=================================

Terima kasih atas pembelian Anda!
`

  return receiptContent
}

function downloadReceipt() {
  try {
    const receiptContent = generateReceiptContent()
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `receipt_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({
      title: 'Success',
      description: 'Receipt berhasil didownload!',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Gagal mendownload receipt',
      color: 'error'
    })
  }
}

function printReceipt() {
  try {
    const currentDate = new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const receiptId = `TRX-${Date.now()}`

    let printContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
          }
          .receipt-container {
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .info {
            margin-bottom: 15px;
          }
          .items {
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 40px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .item-subtotal {
            width: 80px;
            text-align: right;
          }
          .total {
            text-align: right;
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h3>RECEIPT PEMBELIAN</h3>
          </div>
          <div class="info">
            <div>ID: ${receiptId}</div>
            <div>Tanggal: ${currentDate}</div>
          </div>
          <div class="items">
    `

    data.value.forEach(item => {
      printContent += `
        <div class="item-row">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">${item.quantity}x</div>
          <div class="item-price">Rp.${Number(item.price).toLocaleString('id-ID')}</div>
          <div class="item-subtotal">Rp.${Number(item.subtotal).toLocaleString('id-ID')}</div>
        </div>
      `
    })

    printContent += `
          </div>
          <div class="total">
          <div>
            Dari Customer: Rp.${Number(posStore.amountPaid).toLocaleString('id-ID')}
          </div>
            TOTAL: Rp.${Number(getTotalList.value).toLocaleString('id-ID')}
          </div>
          <div class="total">
            KEMBALI: Rp.${Math.max(0, posStore.amountPaid - Number(getTotalList.value)).toLocaleString('id-ID')}
          </div>
          <div class="footer">
            <p>Terima kasih atas pembelian Anda!</p>
          </div>
        </div>
      </body>
    </html>
    `

    // Create new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        if (width.value > 768) {
          printWindow.close()
        }
        // printWindow.close()
      }

      toast.add({
        title: 'Success',
        description: 'Receipt siap untuk dicetak!',
        color: 'success'
      })
    } else {
      throw new Error('Popup blocked')
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Gagal membuka jendela print. Pastikan popup tidak diblokir.',
      color: 'error'
    })
  }
}

function clearCartAndClose() {

  checkoutOpen.value = false
  toast.add({
    title: 'Success',
    description: 'Cart berhasil dikosongkan!',
    color: 'success'
  })
  data.value = []
}

async function handleCheckout() {
  if (data.value.length === 0) return

  const method = isCash.value ? 'cash' : 'transfer'

  try {
    if (method === 'transfer') {
      const response = await $fetch<any>('/api/payment/midtrans', {
        method: 'POST',
        body: {
          amount: getTotalList.value,
          items: data.value
        }
      })

      if (response.status === 'success') {
        const paymentData = response.data
        if (paymentData.va_numbers || paymentData.payment_code || ['qris', 'gopay', 'shopeepay'].includes(paymentData.payment_type)) {
          posStore.pendingPayment = paymentData
          $fetch('/api/events/publish', {
            method: 'POST',
            body: { type: 'PAYMENT_PENDING', data: paymentData }
          }).catch(console.error)
          return
        }

        if (paymentData.token && (window as any).snap) {
          (window as any).snap.pay(paymentData.token, {
            onSuccess: (result: any) => {
              handlePaymentSuccess(result)
            },
            onPending: (result: any) => {
              posStore.pendingPayment = result
              $fetch('/api/events/publish', {
                method: 'POST',
                body: { type: 'PAYMENT_PENDING', data: result }
              }).catch(console.error)
            }
          })
        }
      }
    } else {
      completeCheckout()
    }
  } catch (error) {
    console.error('Checkout error:', error)
    toast.add({ title: 'Error', description: 'Gagal memproses checkout', color: 'error' })
  }
}

function completeCheckout() {
  checkoutOpen.value = true
  const getItemsLocalStorage = localStorage.getItem('pos_menus')

  const report = data.value.map((item: TableList) => ({
    ...item,
    id: 'TRX-' + Date.now(),
    created_at: startOfDay(new Date(addDays(new Date(), 1).toISOString())),
    byCustomer: isCash.value ? posStore.amountPaid : getTotalList.value,
  }))
  const resultReport = [...report, ...JSON.parse(localStorage.getItem('report') || '[]')]
  localStorage.setItem('report', JSON.stringify(resultReport))

  const getProduct = getItemsLocalStorage && JSON.parse(getItemsLocalStorage).map((item: Product) => {
    const findProduct = data.value.find(product => product.id === item.id)
    if (findProduct) {
      return {
        ...item,
        stock: item.stock - findProduct.quantity
      }
    }
    return item
  })
  product.value = getProduct
  localStorage.setItem('data', JSON.stringify(getProduct))
}

watch(open, (newValue) => {
  if (!newValue) {
    state.product_name = {
      id: 0,
      name: '',
      price: 0,
      stock: 0
    }
    state.quantity = 1
  }
})


onMounted(() => {
  product.value = JSON.parse(localStorage.getItem('pos_menus') || '[]')

  // Subscribe to SSE for real-time updates
  const eventSource = new EventSource('/api/events/subscribe')

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      if (payload.type === 'PAYMENT_PENDING') {
        posStore.pendingPayment = payload.data
        startStatusPolling()
      } else if (payload.type === 'PAYMENT_SUCCESS') {
        handlePaymentSuccess(payload.data, false) // Do NOT broadcast back
      } else if (payload.type === 'ORDER_COMPLETED') {
        showThankYou.value = true
        setTimeout(() => {
          showThankYou.value = false
        }, 2000)
      }
    } catch (e) {
      console.error('SSE Error:', e)
    }
  }

  onUnmounted(() => {
    eventSource.close()
    if (statusInterval.value) clearInterval(statusInterval.value)
  })
})

async function checkPaymentStatus() {
  if (!posStore.pendingPayment) return
  checkingStatus.value = true

  try {
    const response: any = await $fetch(`/api/payment/status?order_id=${posStore.pendingPayment.order_id}`)
    if (response.status === 'success') {
      const transactionStatus = response.data.transaction_status
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        handlePaymentSuccess(response.data)
      } else if (transactionStatus === 'pending') {
        toast.add({ title: 'Payment Pending', description: 'Silakan selesaikan pembayaran Anda.', color: 'warning' })
      } else {
        toast.add({ title: 'Payment Status', description: `Status: ${transactionStatus}`, color: 'neutral' })
      }
    }
  } catch (e) {
    console.error('Check Status Error:', e)
  } finally {
    checkingStatus.value = false
  }
}

function startStatusPolling() {
  if (statusInterval.value) clearInterval(statusInterval.value)
  statusInterval.value = setInterval(() => {
    if (posStore.pendingPayment) {
      checkPaymentStatus()
    } else {
      clearInterval(statusInterval.value)
    }
  }, 5000) // Poll every 5 seconds
}

async function handlePaymentSuccess(data: any, broadcast = true) {
  if (statusInterval.value) clearInterval(statusInterval.value)
  posStore.pendingPayment = null

  toast.add({
    title: 'Payment Successful',
    description: 'Pembayaran telah diterima. Order akan segera diproses.',
    color: 'success'
  })

  // Broadcast success to other clients only if detected locally
  if (broadcast) {
    $fetch('/api/events/publish', {
      method: 'POST',
      body: { type: 'PAYMENT_SUCCESS', data }
    }).catch(() => { })

    await finalizeOrder()
  }
}

async function finalizeOrder() {
  const savedReports = JSON.parse(localStorage.getItem('report') || '[]')

  const newReport = {
    id: `TRX-${Date.now()}`,
    date: new Date().toISOString(),
    items: data.value.map(item => ({ ...item })),
    total: getTotalList.value,
    method: 'transfer',
    amountPaid: getTotalList.value,
    change: 0
  }

  savedReports.push(newReport)
  localStorage.setItem('report', JSON.stringify(savedReports))

  // Update Stock
  const menus = JSON.parse(localStorage.getItem('pos_menus') || '[]')
  data.value.forEach(item => {
    const menuIndex = menus.findIndex((m: any) => m.id === item.id)
    if (menuIndex !== -1) {
      menus[menuIndex].stock -= item.quantity
    }
  })
  localStorage.setItem('pos_menus', JSON.stringify(menus))

  checkoutOpen.value = true
  // We keep data.value for the receipt modal, then clear it when modal closes or manually
}
</script>

<style lang="postcss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>