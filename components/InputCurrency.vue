<template>
  <div class="w-full">
    <div>
      <div class="relative">
        <UInput type="tel" @input="keyPress($event)" v-model="vModel" v-bind="$attrs">
          <template #leading v-if="$slots.leading">
            <slot name="leading" />
          </template>
          <template #trailing v-if="$slots.trailing">
            <slot name="trailing" />
          </template>
        </UInput>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UInput } from '#components'

const rawInput = ref('')

defineProps({
  error: {
    type: String,
    default: ''
  }
})

const vModel = defineModel('')


const formatUang = (value: string): string => {
  const angkaBersih = value.replace(/[^\d]/g, '')
  if (angkaBersih === '') return ''
  return angkaBersih.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}


function keyPress(e: any) {
  if (!e) return
  const input = e.target as HTMLInputElement
  const cleanedValue = input.value.replace(/[^\d]/g, '')
  rawInput.value = cleanedValue.replace(/^0+(?!$)/, '')
  console.log(String(formatUang(rawInput.value)))
  input.value = String(formatUang(rawInput.value)) // Format nilai input

}
</script>