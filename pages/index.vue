<template>
  <div class="min-h-screen p-5">
    <div class="flex justify-end mb-5 gap-3">
      <UButton label="Mengelola Produk" color="success" variant="solid" @click="$router.push('/product')" />
      <UModal v-model:open="open" title="Tambah Order">
        <UButton label="Tambah Order" color="primary" variant="solid" />
        <template #body>
          <div class="w-full">
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
              <UFormField label="Nama Produk" name="product_name">
                <USelectMenu v-model="state.product_name" class="w-full" :items="getProduct" value-key="id"
                  label-key="product_name" />
              </UFormField>

              <UFormField label="Jumlah" name="quantity">
                <div class="flex gap-3">
                  <UButton @click="() => {
                    if (!state.quantity) return
                    state.quantity += 1
                    if (state.quantity && state.quantity > (getProduct.find((item) => item.id === state.product_name)?.stock || 0)) {
                      state.quantity = getProduct.find((item) => item.id === state.product_name)?.stock || 1
                    }

                  }" :disabled="!(getProduct.find((item) => item.id ===
                    state.product_name)?.stock)">+</UButton>
                  <UInput v-model="state.quantity" type="number" class="!w-[80px]" @input="(e: any) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value && Number(target.value) <= 1) {
                      (target.value as any) = 1
                    }
                    if (target.value && Number(target.value) > (getProduct.find((item) => item.id === state.product_name)?.stock || 0)) {
                      (target.value as any) = getProduct.find((item) => item.id === state.product_name)?.stock || 0
                    }
                  }">
                    <template #trailing>
                      <span v-if="state.product_name">/ {{getProduct.find((item) => item.id ===
                        state.product_name)?.stock}}x</span>
                    </template>
                  </UInput>
                  <UButton @click="() => {
                    if (!state.quantity) return
                    state.quantity -= 1
                  }" :disabled="!!(state.quantity && state.quantity <= 1)">-</UButton>
                </div>
              </UFormField>

              <div>
                <div class="flex gap-14">
                  <div>Harga</div>
                  <div>Rp.{{ getTotal.price ? Number(getTotal.price).toLocaleString('id-ID') : 0 }}</div>
                </div>
                <div class="flex gap-4">
                  <div>Total Harga</div>
                  <div>Rp.{{ getTotal.subtotal ? Number(getTotal.subtotal).toLocaleString('id-ID') : 0 }}</div>
                </div>
              </div>
              <div class="flex gap-3 justify-end">
                <UButton type="reset" @click="open = false" color="neutral" variant="ghost">
                  Cancel
                </UButton>
                <UButton type="submit">
                  Submit
                </UButton>
              </div>
            </UForm>
          </div>
        </template>
      </UModal>
    </div>

    <u-table id="table" :data="data" :columns="columns">
      <template #quantity-cell="{ row }">
        <UButton @click="handleCount('plus', row.original.id)"
          :disabled="row.original.quantity >= (product.length > 0 && product.find((item) => item.id === row.original.id)?.stock || 0)">
          +
        </UButton>
        <span class="mx-2">{{ row.original.quantity }}</span>
        <UButton @click="handleCount('min', row.original.id)" :variant="'solid'" :disabled="row.original.quantity <= 1">
          -</UButton>
      </template>
      <template #price-cell="{ row }">
        <span>Rp.{{ Number(row.original.price).toLocaleString('id-ID') }}</span>
      </template>
      <template #subtotal-cell="{ row }">
        <span>Rp.{{ Number(Number(row.original.price) * row.original.quantity).toLocaleString('id-ID') }}</span>
      </template>
      <template #action-cell="{ row }">
        <UButton icon="i-lucide-trash" color="error" variant="ghost" aria-label="Delete"
          @click="removeItem(row.original.id)" />
      </template>
    </u-table>


    <div class="flex justify-end mt-4 font-bold text-lg">
      <div class="flex flex-col gap-2">
        <InputCurrency v-model="changeMoney">
          <template #leading>
            <span class="text-sm">Rp.</span>
          </template>
        </InputCurrency>
        Total: Rp.{{ Number(getTotalList).toLocaleString('id-ID') }}
        <div>Kembali: {{ changeMoney && Number(Number(changeMoney.replace(/[.]/g, '')) -
          Number(getTotalList)).toLocaleString('id-ID') }}</div>
      </div>
    </div>

    <UModal v-model:open="checkoutOpen" title="Checkout - Receipt" :dismissible="false" :close="false">
      <UButton label="Checkout" color="success" variant="solid" class="w-full flex justify-center mt-4"
        :disabled="data.length === 0" @click="handleCheckout" />
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
                <div class="truncate">{{ item.product_name }}</div>
                <div class="text-center">{{ item.quantity }}x</div>
                <div class="text-right">Rp.{{ Number(item.price).toLocaleString('id-ID') }}</div>
                <div class="text-right">Rp.{{ Number(item.subtotal).toLocaleString('id-ID') }}</div>
              </div>
            </template>
          </div>

          <div class="border-t-2 border-dashed border-black mt-4 pt-2">
            <div class="flex justify-between font-bold">
              <span>DARI CUSTOMER:</span>
              <span>Rp.{{ changeMoney && Number(Number(changeMoney.replace(/[.]/g, ''))).toLocaleString('id-ID')
                }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>TOTAL HARGA:</span>
              <span>Rp.{{ Number(getTotalList).toLocaleString('id-ID') }}</span>
            </div>
            <!-- Divider -->
            <div class="border-2 border-black w-full border-dashed my-4"></div>

            <div class="flex justify-between font-bold">
              <span>KEMBALI:</span>
              <span>Rp.{{ changeMoney && Number(Number(changeMoney.replace(/[.]/g, '')) - Number(getTotalList))
                .toLocaleString('id-ID') }}</span>
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
  product_name: z.string().min(1),
  quantity: z.number().refine((value) => {
    const getProductList = getProduct.value.find(item => item.id === state.product_name)
    if (Number(value) > Number((getProductList)?.stock)) return false
    if (Number(value) <= 0) return false
    return true
  },
    { message: 'Quantity must be greater than 0 and less than or equal to stock' })
})

type Schema = z.output<typeof schema>

interface TableList {
  id: string
  product_name: string
  quantity: number
  price: string
  subtotal: string
}

interface Product {
  id: string;
  product_name: string;
  stock: number;
  price: string;
}


const open = ref<boolean>(false)
const checkoutOpen = ref<boolean>(false)
const changeMoney = ref<string | null>(null)

const state = reactive<Partial<Schema>>({
  product_name: '',
  quantity: 1
})

const data = ref<TableList[]>([])
const toast = useToast()

const columns: TableColumn<TableList>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'product_name',
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
  {
    accessorKey: 'action',
    header: 'Action'
  }
]

const product = ref<Product[]>([])

const getProduct = computed(() => product.value.map((item: Product) => {
  return {
    label: item.product_name,
    value: item.id,
    ...item
  }
}).filter((item: Product) => item.stock > 0 && data.value.filter(product => product.id === item.id).length === 0) as Product[])

function handleCount(type: 'min' | 'plus', id: string) {
  if (type === 'plus') {
    data.value = data.value.map((item: TableList) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: item.quantity + 1,
          subtotal: String(Number(item.price) * (item.quantity + 1))
        }
      }
      return item
    }) as TableList[]
    return
  }
  data.value = data.value.map((item: TableList) => {
    if (item.id === id) {
      const newQuantity = Math.max(0, item.quantity - 1)
      return {
        ...item,
        quantity: newQuantity,
        subtotal: String(Number(item.price) * newQuantity)
      }
    }
    return item
  }) as TableList[]
}

function removeItem(id: string) {
  data.value = data.value.filter(item => item.id !== id)
  toast.add({
    title: 'Success',
    description: 'Item berhasil dihapus',
    color: 'success'
  })
}

const getTotalList = computed(() => {
  return data.value.reduce((total, item) => {
    return total + Number(item.subtotal)
  }, 0)
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  const findProduct = getProduct.value.find(item => item.id === event.data.product_name)
  const items: TableList = {
    id: findProduct?.id || '',
    product_name: findProduct?.product_name || '',
    quantity: event.data.quantity,
    price: String(getTotal.value.price),
    subtotal: String(getTotal.value.subtotal)
  }
  data.value = [...data.value, items]
  open.value = false
  state.product_name = ''
  state.quantity = 1
}

const getTotal = computed(() => {
  const getPrice = getProduct.value.find(item => item.id === state.product_name) as Product
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
    const itemName = item.product_name.padEnd(15)
    const qty = `${item.quantity}x`.padStart(5)
    const price = `Rp.${Number(item.price).toLocaleString('id-ID')}`.padStart(12)
    const subtotal = `Rp.${Number(item.subtotal).toLocaleString('id-ID')}`.padStart(12)

    receiptContent += `${itemName} ${qty} ${price} ${subtotal}\n`
  })

  receiptContent += `
=================================
Dari Customer: Rp.${changeMoney.value && Number(Number(getTotalList.value)).toLocaleString('id-ID')}
TOTAL Harga: Rp.${Number(getTotalList.value).toLocaleString('id-ID')}
=================================
KEMBALI: Rp.${changeMoney.value && Number(Number(changeMoney.value.replace(/[.]/g, '')) - Number(getTotalList.value)).toLocaleString('id-ID')}
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
          <div class="item-name">${item.product_name}</div>
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
            Dari Customer: Rp.${changeMoney.value && Number(Number(getTotalList.value)).toLocaleString('id-ID')}
          </div>
            TOTAL: Rp.${Number(getTotalList.value).toLocaleString('id-ID')}
          </div>
          <div class="total">
            KEMBALI: Rp.${changeMoney.value && Number(Number(changeMoney.value.replace(/[.]/g, '')) - Number(getTotalList.value)).toLocaleString('id-ID')}
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

function handleCheckout() {
  checkoutOpen.value = true
  const getItemsLocalStorage = localStorage.getItem('data')

  const report = data.value.map((item: TableList) => ({
    ...item,
    id: 'TRX-' + Date.now(),
    created_at: startOfDay(new Date(addDays(new Date(), 1).toISOString())),
    byCustomer: changeMoney.value ? Number(changeMoney.value.replace(/[.]/g, '')) : 0,
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
    state.product_name = ''
    state.quantity = 1
  }
})


onMounted(() => {
  product.value = JSON.parse(localStorage.getItem('data') || '[]')
})
</script>