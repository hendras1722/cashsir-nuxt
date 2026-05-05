<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth'
})

const posStore = usePosStore()
const { menus, categories } = storeToRefs(posStore)

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'categoryId', header: 'Category' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'stock', header: 'Stock' },
  { id: 'actions', header: 'Actions' }
]

const isOpen = ref(false)
const isEditing = ref(false)

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.object({
    id: z.number(),
    name: z.string(),
    icon: z.string()
  }, { required_error: 'Category is required' }),
  price: z.number().min(100, 'Price must be at least Rp. 100'),
  stock: z.number().min(1, 'Stock must be at least 1')
})

type Schema = z.output<typeof schema>

const state = reactive({
  id: 0,
  category: { id: 1, name: 'Food', icon: 'ion:fast-food' },
  name: '',
  price: 0,
  stock: 0
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const openAdd = () => {
  isEditing.value = false
  state.id = Date.now()
  state.category = categories.value[0] || { id: 1, name: 'Food', icon: 'ion:fast-food' }
  state.name = ''
  state.price = 0
  state.stock = 0
  isOpen.value = true
}

const openEdit = (row: any) => {
  isEditing.value = true
  state.id = row.id
  state.category = categories.value.find(c => c.id === row.categoryId) || categories.value[0]
  state.name = row.name
  state.price = row.price
  state.stock = row.stock
  isOpen.value = true
}

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const dataToSave = {
    id: state.id,
    categoryId: state.category.id,
    name: state.name,
    price: state.price,
    stock: state.stock
  }

  if (isEditing.value) {
    const index = menus.value.findIndex(m => m.id === state.id)
    if (index !== -1) menus.value[index] = dataToSave
  } else {
    menus.value.push(dataToSave)
  }
  isOpen.value = false
}

const remove = (id: number) => {
  menus.value = menus.value.filter(m => m.id !== id)
}

const getCategoryName = (id: number) => {
  return categories.value.find(c => c.id === id)?.name || 'Unknown'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Menu Management</h1>
      <UButton icon="i-heroicons-plus" label="Add Menu Item" @click="openAdd" />
    </div>

    <UCard>
      <UTable :data="menus" :columns="columns">
        <template #categoryId-cell="{ row }">
          <UBadge color="neutral" variant="soft">{{ getCategoryName(row.original.categoryId) }}</UBadge>
        </template>

        <template #price-cell="{ row }">
          {{ formatCurrency(row.original.price) }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-heroicons-pencil-square" size="xs" color="neutral" variant="ghost"
              @click="openEdit(row.original)" />
            <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost"
              @click="remove(row.original.id)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isOpen">
      <template #content>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold">{{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}</h3>
                <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                  @click="isOpen = false" />
              </div>
            </template>

            <div class="space-y-4">
              <UFormField label="Item Name" name="name">
                <UInput v-model="state.name" placeholder="e.g. Fried Chicken" class="w-full" />
              </UFormField>

              <UFormField label="Category" name="category">
                <USelectMenu v-model="state.category" :items="categories" :icon="state.category.icon" label-key="name"
                  class="w-full">
                  <!-- <template #item-label>
                    <div v-if="state.category" class="flex items-center gap-2">
                      <UIcon :name="state.category.icon" class="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{{ state.category.name }}</span>
                    </div>
                    <span v-else>Select Category</span>
                  </template> -->
                  <template #item="{ item }">
                    <div class="flex items-center gap-2">
                      <UIcon :name="item.icon" class="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{{ item.name }}</span>
                    </div>
                  </template>
                </USelectMenu>
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Price" name="price">
                  <UInput v-model.number="state.price" type="number" class="w-full" />
                </UFormField>
                <UFormField label="Stock" name="stock">
                  <UInput v-model.number="state.stock" type="number" class="w-full" />
                </UFormField>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                <UButton label="Save" color="primary" type="submit" />
              </div>
            </template>
          </UCard>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
