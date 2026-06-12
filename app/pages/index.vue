<script setup lang="ts">

const config = useRuntimeConfig();
const env = config.public.nodeEnv;
const cacheDriver = config.public.cacheDriver;

useHead({
  title: 'Nuxt/Prisma/Turso Showcase',
  meta: [
    { name: 'description', content: 'A showcase web application built with Nuxt 3, Prisma ORM, and Turso (SQLite on the edge)' }
  ]
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-12 px-4 text-center">
    <p class="text-lg text-gray-600 dark:text-gray-400 font-medium italic">
      (db test will be here)
    </p>
  </div>
</template>
