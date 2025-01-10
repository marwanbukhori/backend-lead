<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation Sidebar -->
    <div
      class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 overflow-y-auto"
    >
      <nav class="p-4">
        <div class="space-y-1">
          <!-- Core Concepts -->
          <div class="text-sm font-medium text-gray-900 py-2">
            Core Concepts
          </div>
          <router-link
            v-for="item in coreTopics"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 text-sm rounded-md"
            :class="[
              currentPath === item.path
                ? 'bg-gray-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ item.title }}
          </router-link>

          <!-- Development Guides -->
          <div class="text-sm font-medium text-gray-900 py-2 mt-6">
            Development
          </div>
          <router-link
            v-for="item in devGuides"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 text-sm rounded-md"
            :class="[
              currentPath === item.path
                ? 'bg-gray-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ item.title }}
          </router-link>

          <!-- DevOps -->
          <div class="text-sm font-medium text-gray-900 py-2 mt-6">DevOps</div>
          <router-link
            v-for="item in devopsTopics"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 text-sm rounded-md"
            :class="[
              currentPath === item.path
                ? 'bg-gray-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ item.title }}
          </router-link>

          <!-- Best Practices -->
          <div class="text-sm font-medium text-gray-900 py-2 mt-6">
            Best Practices
          </div>
          <router-link
            v-for="item in bestPractices"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 text-sm rounded-md"
            :class="[
              currentPath === item.path
                ? 'bg-gray-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ item.title }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <div class="max-w-4xl mx-auto px-8 py-8">
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <template v-else>
          <!-- Content Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ currentDocument?.metadata?.title }}
            </h1>
            <p class="mt-2 text-gray-600">
              {{ currentDocument?.metadata?.description }}
            </p>
          </div>

          <!-- Markdown Content -->
          <MarkdownViewer
            v-if="currentDocument?.content"
            :content="currentDocument.content"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useDocsStore } from "@/stores/docs";
import { storeToRefs } from "pinia";
import MarkdownViewer from "@/components/MarkdownViewer.vue";

// Core Topics
const coreTopics = [
  {
    title: "Domain-Driven Design",
    path: "/learning/ddd",
  },
  {
    title: "CQRS Pattern",
    path: "/learning/cqrs",
  },
  {
    title: "Event-Driven Architecture",
    path: "/learning/event-driven",
  },
  {
    title: "Authentication & Authorization",
    path: "/learning/auth",
  },
];

// Development Guides
const devGuides = [
  {
    title: "API Design",
    path: "/learning/api-design",
  },
  {
    title: "Testing Strategies",
    path: "/learning/testing",
  },
  {
    title: "Database Design",
    path: "/dev/database",
  },
  {
    title: "Caching Strategies",
    path: "/learning/caching",
  },
];

// DevOps Topics
const devopsTopics = [
  {
    title: "CI/CD Pipeline",
    path: "/ops/cicd",
  },
  {
    title: "Monitoring",
    path: "/ops/monitoring",
  },
  {
    title: "Deployment",
    path: "/ops/deployment",
  },
];

// Best Practices
const bestPractices = [
  {
    title: "Code Quality",
    path: "/best-practices/code-quality",
  },
  {
    title: "Security",
    path: "/best-practices/security",
  },
  {
    title: "Performance",
    path: "/best-practices/performance",
  },
];

const route = useRoute();
const docsStore = useDocsStore();
const { currentDoc: currentDocument, loading } = storeToRefs(docsStore);
const currentPath = computed(() => route.path);

// Load document when route changes
watch(
  () => route.params.path,
  async (newPath: string | string[] | undefined) => {
    if (newPath && typeof newPath === "string") {
      await docsStore.fetchDoc(newPath);
    }
  },
  { immediate: true }
);
</script>
