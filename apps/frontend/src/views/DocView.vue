<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"
      ></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <h2 class="text-2xl font-bold text-red-600 mb-2">Error</h2>
      <p class="text-gray-600">{{ error }}</p>
    </div>

    <div v-else-if="document" class="max-w-4xl mx-auto">
      <!-- Document Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{{ document.title }}</h1>
        <div class="flex items-center text-sm text-gray-500">
          <span class="flex items-center">
            <i class="fas fa-eye mr-1"></i>
            {{ document.views }} views
          </span>
          <span class="mx-2">•</span>
          <span>Last updated {{ formatDate(document.updated_at) }}</span>
        </div>
        <div v-if="document.tags?.length" class="mt-4 flex gap-2">
          <span
            v-for="tag in document.tags"
            :key="tag"
            class="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Document Content -->
      <div class="prose prose-lg max-w-none">
        <div v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { marked } from "marked";
import hljs from "highlight.js";
import { docsService, type Document } from "@/services/docs.service";

// Initialize marked with syntax highlighting
marked.setOptions({
  highlight: (code: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
} as any);

const route = useRoute();
const document = ref<Document | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Get the document path from the route
const docPath = computed(() => {
  const path = route.path.replace("/docs", "");
  return path.endsWith("/") ? path.slice(0, -1) : path;
});

// Render markdown content
const renderedContent = computed(() => {
  if (!document.value?.content) return "";
  return marked(document.value.content);
});

onMounted(async () => {
  try {
    document.value = await docsService.getDoc(docPath.value);
  } catch (err) {
    error.value = "Failed to load document";
    console.error("Error loading document:", err);
  } finally {
    loading.value = false;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style>
@import "highlight.js/styles/github.css";
</style>
