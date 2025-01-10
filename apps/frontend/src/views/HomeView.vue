<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Source Of Truth</h1>
        <h2 class="text-md text-gray-500">Senior Backend Engineer Guide</h2>
      </div>
      <!-- Search Command Palette Trigger -->
      <div class="mb-8 flex items-center justify-between">
        <p class="text-gray-600">
          Press <kbd class="px-2 py-1 bg-gray-100 rounded">⌘ K</kbd> to search
        </p>
        <button
          @click="openCommandPalette"
          class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>Quick Search</span>
          <span class="text-sm text-gray-500">⌘K</span>
        </button>
      </div>

      <!-- Main Content -->
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Core Concepts -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">Core Concepts</h2>
          <TableOfContents
            :sections="[
              {
                title: 'Core Concepts',
                items: coreTopics,
              },
            ]"
          />
        </div>

        <!-- Development Guides -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">Development Guides</h2>
          <TableOfContents
            :sections="[
              {
                title: 'Development',
                items: devGuides,
              },
            ]"
          />
        </div>
      </div>

      <!-- Additional Sections -->
      <div class="mt-8 grid md:grid-cols-2 gap-8">
        <!-- DevOps & Deployment -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">DevOps & Deployment</h2>
          <TableOfContents
            :sections="[
              {
                title: 'Operations',
                items: devopsTopics,
              },
            ]"
          />
        </div>

        <!-- Best Practices -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">Best Practices</h2>
          <TableOfContents
            :sections="[
              {
                title: 'Best Practices',
                items: bestPractices,
              },
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Command Palette -->
    <CommandPalette
      v-if="showCommandPalette"
      :topics="allTopics"
      @close="closeCommandPalette"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDocsStore } from "@/stores/docs";
import CommandPalette from "@/components/CommandPalette.vue";
import TableOfContents from "@/components/TableOfContents.vue";

const docsStore = useDocsStore();
const showCommandPalette = ref(false);

// Core Topics
const coreTopics = [
  {
    title: "Domain-Driven Design",
    description: "Learn about DDD principles and implementation",
    path: "/learning/ddd",
    tags: ["Architecture", "Design Patterns"],
  },
  {
    title: "CQRS Pattern",
    description: "Command Query Responsibility Segregation",
    path: "/learning/cqrs",
    tags: ["Architecture", "Patterns"],
  },
  {
    title: "Event-Driven Architecture",
    description: "Event sourcing and message handling",
    path: "/learning/event-driven",
    tags: ["Architecture", "Events"],
  },
  {
    title: "Authentication & Authorization",
    description: "Security implementation and best practices",
    path: "/learning/auth",
    tags: ["Security"],
  },
];

// Development Guides
const devGuides = [
  {
    title: "API Design",
    description: "RESTful principles and implementation",
    path: "/learning/api-design",
    tags: ["API", "REST"],
  },
  {
    title: "Testing Strategies",
    description: "Unit, integration, and E2E testing",
    path: "/learning/testing",
    tags: ["Testing"],
  },
  {
    title: "Database Design",
    description: "Schema design and optimization",
    path: "/dev/database",
    tags: ["Database"],
  },
  {
    title: "Caching Strategies",
    description: "Implementation of caching patterns",
    path: "/learning/caching",
    tags: ["Performance"],
  },
];

// DevOps Topics
const devopsTopics = [
  {
    title: "CI/CD Pipeline",
    description: "Continuous integration and deployment",
    path: "/ops/cicd",
    tags: ["DevOps"],
  },
  {
    title: "Monitoring",
    description: "System monitoring and logging",
    path: "/ops/monitoring",
    tags: ["DevOps"],
  },
  {
    title: "Deployment",
    description: "Production deployment guides",
    path: "/ops/deployment",
    tags: ["DevOps"],
  },
];

// Best Practices
const bestPractices = [
  {
    title: "Code Quality",
    description: "Coding standards and best practices",
    path: "/best-practices/code-quality",
    tags: ["Quality"],
  },
  {
    title: "Security",
    description: "Security best practices and implementation",
    path: "/best-practices/security",
    tags: ["Security"],
  },
  {
    title: "Performance",
    description: "Performance optimization techniques",
    path: "/best-practices/performance",
    tags: ["Performance"],
  },
];

// Combine all topics for search
const allTopics = computed(() => [
  ...coreTopics,
  ...devGuides,
  ...devopsTopics,
  ...bestPractices,
]);

// Command palette handlers
const openCommandPalette = () => {
  showCommandPalette.value = true;
};

const closeCommandPalette = () => {
  showCommandPalette.value = false;
};

// Keyboard shortcut for command palette
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    openCommandPalette();
  }
});
</script>
