<!-- layouts/dashboard.vue -->
<template>
  <div class="h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <div :class="[
      'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out',
      sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64'
    ]" :style="!sidebarCollapsed && sidebarWidth ? `width: ${sidebarWidth}px` : ''">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">D</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-2 py-4 space-y-1">
        <UNavigationMenu :collapsed="sidebarCollapsed" :items="items" color="primary" orientation="vertical" />
      </nav>

      <!-- Resize Handle -->
      <div v-if="!sidebarCollapsed"
        class="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors duration-150 group"
        @mousedown="startResize">
        <div class="w-full h-full group-hover:bg-blue-500 transition-colors duration-150"></div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div v-if="!sidebarCollapsed"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
      @click="toggleSidebar"></div>

    <!-- Main Content -->
    <div :class="[
      'flex flex-col transition-all duration-300 ease-in-out min-h-screen',
      sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
    ]" :style="!sidebarCollapsed && sidebarWidth ? `margin-left: ${sidebarWidth}px` : ''">
      <!-- Top Navbar -->
      <header class="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div class="flex items-center space-x-4">
          <UButton icon variant="ghost" @click="toggleSidebar">
            <UIcon name="i-heroicons-bars-3-16-solid" />
          </UButton>
        </div>

        <div class="flex items-center space-x-4">
          <UButton label="View Page" color="success" variant="outline" @click="$router.push('/')"></UButton>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <div class="mx-auto">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <slot />

          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>

const sidebarCollapsed = ref(false)
const sidebarWidth = ref(256)
const isResizing = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const startResize = (e) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e) => {
  if (!isResizing.value) return

  const newWidth = e.clientX
  if (newWidth >= 200 && newWidth <= 400) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Handle responsive behavior
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      sidebarCollapsed.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

const route = useRoute()


const items = computed(() => [
  {
    label: 'Product',
    to: '/product',
    icon: 'i-lucide-package-search',
    active: route.path === '/product',
    class: 'h-[50px]',
    activeClass: '!text-blue-200 before:!bg-blue-500 rounded-lg'
  }, {
    label: 'Report',
    to: '/report',
    icon: 'i-lucide-clipboard-plus',
    active: route.path === '/report',
    class: 'h-[50px]',
    activeClass: '!text-blue-200 before:!bg-blue-500 rounded-lg'
  }
])
</script>