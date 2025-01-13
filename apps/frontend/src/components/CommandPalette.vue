<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="command-palette-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity"
      @click="$emit('close')"
    />

    <div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
      <!-- Command Palette Panel -->
      <div
        class="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
      >
        <!-- Search Input -->
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            class="h-12 w-full border-0 bg-transparent pl-11 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search documentation..."
            @keydown.down.prevent="incrementSelectedIndex"
            @keydown.up.prevent="decrementSelectedIndex"
            @keydown.enter="selectResult"
            @keydown.esc="$emit('close')"
          />
          <!-- Close Button -->
          <button
            class="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-600"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Results -->
        <div
          v-if="filteredTopics.length > 0"
          class="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800"
        >
          <div
            v-for="(topic, index) in filteredTopics"
            :key="topic.path"
            :class="[
              'cursor-pointer select-none px-4 py-2',
              selectedIndex === index
                ? 'bg-gray-900 text-white'
                : 'hover:bg-gray-100',
            ]"
            @click="navigateToTopic(topic)"
            @mousemove="selectedIndex = index"
          >
            <div
              class="font-medium"
              :class="selectedIndex === index ? 'text-white' : 'text-gray-900'"
            >
              {{ topic.title }}
            </div>
            <div
              :class="
                selectedIndex === index ? 'text-gray-300' : 'text-gray-600'
              "
            >
              {{ topic.description }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="query" class="p-4 text-sm text-gray-500">
          No results found for "{{ query }}"
        </div>

        <!-- Initial State -->
        <div v-else class="p-4 text-sm text-gray-500">
          Type to start searching...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  topics: Array<{
    title: string;
    description: string;
    path: string;
  }>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();
const query = ref("");
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement | null>(null);

// Filter topics based on search query
const filteredTopics = computed(() => {
  if (!query.value) return props.topics;
  const searchQuery = query.value.toLowerCase();
  return props.topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery) ||
      topic.description.toLowerCase().includes(searchQuery)
  );
});

// Navigation handlers
const navigateToTopic = (topic: { path: string }) => {
  router.push(topic.path);
  emit("close");
};

const selectResult = () => {
  if (filteredTopics.value.length > 0) {
    navigateToTopic(filteredTopics.value[selectedIndex.value]);
  }
};

// Keyboard navigation
const incrementSelectedIndex = () => {
  selectedIndex.value = (selectedIndex.value + 1) % filteredTopics.value.length;
};

const decrementSelectedIndex = () => {
  selectedIndex.value =
    selectedIndex.value <= 0
      ? filteredTopics.value.length - 1
      : selectedIndex.value - 1;
};

// Focus search input on mount
onMounted(async () => {
  await nextTick();
  searchInput.value?.focus();
});
</script>
