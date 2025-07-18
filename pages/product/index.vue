<script setup lang="ts">
import { UTable } from '#components';
import type { TableColumn, FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod'
import InputCurrency from '~/components/InputCurrency.vue';

interface TableList {
  id: string
  product_name: string
  stock: number
  price: string
}

const open = ref(false)
const data = ref<TableList[]>([])
const toast = useToast()

const schema = z.object({
  product_name: z.string().min(1),
  stock: z.number().refine((value) => {
    if (Number(value) <= 0) return false
    return true
  }),
  price: z.string().min(1),
})

const state = reactive<Partial<z.infer<typeof schema>>>({
  price: '',
  product_name: '',
  stock: 0
})

const getData = computed(() => {
  return data.value
})

onMounted(() => {
  const getItemsLocalStorage = localStorage.getItem('data')
  data.value = getItemsLocalStorage && JSON.parse(getItemsLocalStorage) || []
})

const columns: TableColumn<TableList>[] = [
  {
    accessorKey: 'id',
    header: 'id',
  },
  {
    accessorKey: 'product_name',
    header: 'Name',

  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'price',
    header: 'Harga'
  },
  {
    accessorKey: 'action',
    header: ''
  }
]

const onSubmit = (event: FormSubmitEvent<z.infer<typeof schema>>) => {
  open.value = false
  data.value = [
    ...data.value,
    {
      id: generateUUID(),
      product_name: event.data.product_name,
      stock: event.data.stock,
      price: event.data.price.replace(/[.]/g, '')
    }
  ]
  localStorage.setItem('data', JSON.stringify(data.value))
}

function removeItem(id: string) {
  data.value = data.value.filter(item => item.id !== id)
  localStorage.setItem('data', JSON.stringify(data.value))
  toast.add({
    title: 'Success',
    description: 'Item berhasil dihapus',
    color: 'success'
  })
}
</script>

<template>
  <div class="flex justify-end mb-5">
    <UModal v-model:open="open" title="Add Produk">
      <UButton label="Add Produk" color="primary" variant="solid" />

      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Produk Name" name="product_name">
            <UInput v-model="state.product_name" class="w-full" />
          </UFormField>

          <UFormField label="Stock" name="stock">
            <UInput v-model="state.stock" type="number" class="w-fit" />
          </UFormField>

          <UFormField label="Harga" name="price">
            <InputCurrency v-model="state.price" class="w-fit">
              <template #leading>
                <span class="text-sm">Rp.</span>
              </template>
            </InputCurrency>
          </UFormField>

          <div class="flex gap-3 justify-end">
            <UButton type="reset" @click="open = false" color="neutral" variant="ghost">
              Cancel
            </UButton>
            <UButton type="submit">
              Submit
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
  <div>
    <UTable :columns="columns" :data="getData">
      <template #action-cell="{ row }">
        <UButton icon="i-lucide-trash" color="error" variant="ghost" aria-label="Delete"
          @click="removeItem(row.original.id)" />
      </template>
    </UTable>
  </div>
</template>