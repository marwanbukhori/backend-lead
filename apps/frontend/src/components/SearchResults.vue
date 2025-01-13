<template>
  <div class="search-results">
    <div v-for="result in results" :key="result.id" class="result-item">
      <!-- Result Header -->
      <div class="flex items-center justify-between mb-2">
        <router-link
          :to="result.path"
          class="text-lg font-medium text-gray-900 hover:text-black"
        >
          <span
            v-if="result.highlights?.title"
            v-html="result.highlights.title[0]"
          />
          <span v-else>{{ result.title }}</span>
        </router-link>
        <span class="text-sm text-gray-500"
          >Score: {{ result.score.toFixed(2) }}</span
        >
      </div>

      <!-- Result Description -->
      <p class="text-sm text-gray-600 mb-2">{{ result.description }}</p>

      <!-- Content Highlights -->
      <div v-if="result.highlights?.content" class="mt-2 space-y-1">
        <div
          v-for="(highlight, index) in result.highlights.content"
          :key="index"
          class="text-sm bg-yellow-50 p-2 rounded"
          v-html="highlight"
        />
      </div>

      <!-- Breadcrumb Path -->
      <div class="mt-2 text-sm text-gray-500">
        {{ formatPath(result.path) }}
      </div>
    </div>

    <!-- No Results State -->
    <div v-if="results.length === 0" class="text-center py-8">
      <p class="text-gray-500">No results found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  results: Array<{
    id: string;
    score: number;
    title: string;
    description: string;
    path: string;
    highlights?: {
      title?: string[];
      content?: string[];
    };
  }>;
}>();

const formatPath = (path: string): string => {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" > ");
};
</script>

<style scoped>
.result-item {
  @apply p-4 border border-gray-200 rounded-lg mb-4 hover:shadow-md transition-shadow;
}

:deep(.highlight) {
  @apply bg-yellow-200 px-1 rounded;
}
</style>
