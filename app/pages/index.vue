<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'Nuxt/Prisma/Turso Showcase',
  meta: [
    { name: 'description', content: 'A showcase web application built with Nuxt 3, Prisma ORM, and Turso (SQLite on the edge)' }
  ]
})

const config = useRuntimeConfig()
const isBypass = config.public.bypassAuth

const auth = !isBypass ? useAuth() : null
const loggedIn = computed(() => isBypass ? true : (auth?.loggedIn ?? false))
const user = computed(() => isBypass ? { given_name: 'Local', family_name: 'Developer', picture: null } : (auth?.user ?? null))

const handleLogout = () => {
  if (isBypass) {
    alert("Auth bypass mode is enabled. In production, this will log you out via Kinde.")
  } else {
    navigateTo('/api/logout', { external: true })
  }
}

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

// Fetch tasks from our new GET API endpoint (only when logged in)
const { data: tasks, refresh, status } = await useFetch<Task[]>('/api/tasks', {
  immediate: loggedIn.value
})
const newTaskTitle = ref('')
const isAdding = ref(false)
const deletingId = ref<string | null>(null)

async function handleAddTask() {
  if (!newTaskTitle.value.trim() || isAdding.value) return
  isAdding.value = true
  try {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: { title: newTaskTitle.value.trim() }
    })
    newTaskTitle.value = ''
    await refresh()
  } catch (error) {
    console.error('Failed to add task:', error)
  } finally {
    isAdding.value = false
  }
}

async function handleDeleteTask(id: string) {
  if (deletingId.value) return
  deletingId.value = id
  try {
    await $fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (error) {
    console.error('Failed to delete task:', error)
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-16 px-4 space-y-6">
    <!-- Logged In: Task Manager View -->
    <div v-if="loggedIn" class="space-y-8">
      <!-- User Profile Header -->
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
            <img v-if="user?.picture" :src="user.picture" alt="Avatar" class="w-full h-full object-cover" />
            <span v-else>{{ user?.given_name?.[0] || 'U' }}</span>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ user?.given_name }} {{ user?.family_name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Authenticated via <span class="font-medium text-indigo-500">{{ isBypass ? 'Mock Auth' : 'Kinde' }}</span>
            </div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-red-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>

      <!-- Header Section -->
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Turso Todo Manager
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          A real-time reactive task list powered by Nuxt 3, Prisma ORM, and Turso.
        </p>
      </div>

      <!-- Card Container -->
      <div class="bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 space-y-6">
        <!-- Add Task Form -->
        <form @submit.prevent="handleAddTask" class="flex gap-2">
          <input
            v-model="newTaskTitle"
            type="text"
            required
            placeholder="Add a new task..."
            class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            :disabled="isAdding"
          />
          <button
            type="submit"
            :disabled="isAdding || !newTaskTitle.trim()"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center gap-2"
          >
            <span v-if="isAdding" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Add
          </button>
        </form>

        <!-- Loading state -->
        <div v-if="status === 'pending'" class="py-12 flex flex-col items-center justify-center space-y-3">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-500">Retrieving tasks...</p>
        </div>

        <!-- Task List -->
        <div v-else-if="tasks && tasks.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto pr-1">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="py-4 flex items-center justify-between group animate-fade-in"
          >
            <div class="flex items-center space-x-3">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {{ task.title }}
              </span>
            </div>
            
            <button
              @click="handleDeleteTask(task.id)"
              :disabled="deletingId === task.id"
              class="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              aria-label="Delete task"
            >
              <svg v-if="deletingId === task.id" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12 space-y-2">
          <p class="text-gray-400 dark:text-gray-500 font-medium">No tasks found</p>
          <p class="text-sm text-gray-400">Add some above to verify your Turso database integration!</p>
        </div>
      </div>
    </div>

    <!-- Logged Out: Welcome & Landing View -->
    <div v-else class="space-y-8 text-center py-12">
      <!-- Header Section -->
      <div class="space-y-2">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Turso Todo Manager
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          A real-time reactive task list powered by Nuxt 3, Prisma ORM, and Turso.
        </p>
      </div>

      <!-- Welcome Card -->
      <div class="bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 p-8 sm:p-12 space-y-6">
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome, friend!</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Please log in with your account to view and manage your personal tasks. You can also explore public sections of the application below.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <a
            href="/api/login"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.553 0-6.436-2.883-6.436-6.436s2.883-6.436 6.436-6.436c1.545 0 2.956.55 4.056 1.458l3.11-3.11C19.22 2.25 15.937 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.208 0 11.24-5.033 11.24-11.24 0-.687-.06-1.353-.18-1.955H12.24z"/>
            </svg>
            Continue with Google
          </a>
          <NuxtLink
            to="/about"
            class="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all"
          >
            About this Showcase
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
