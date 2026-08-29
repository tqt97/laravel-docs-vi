<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const officialUrl = computed(() => {
  const relative = page.value.relativePath.replace(/\\.md$/, '')
  if (!relative || relative === 'index') return 'https://laravel.com/docs/13.x'
  return `https://laravel.com/docs/13.x/${relative}`
})
</script>

<template>
  <section class="official-source" aria-label="Tài liệu gốc">
    <strong>Đối chiếu tài liệu gốc:</strong>
    <a :href="officialUrl" target="_blank" rel="noopener noreferrer">{{ officialUrl }}</a>
  </section>
</template>
