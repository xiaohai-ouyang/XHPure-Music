<template>
  <svg
    class="my-svg-icon"
    :width="sizeValue"
    :height="sizeValue"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size?: number | string
}>()

const sizeValue = computed(() => {
  if (typeof props.size === 'number') return props.size
  return parseInt(props.size as string) || 24
})
</script>
