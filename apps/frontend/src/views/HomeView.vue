<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Senior Backend Engineering Guide</h1>

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

      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"
        ></div>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <h2 class="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p class="text-gray-600">{{ error }}</p>
      </div>

      <div v-else>
        <!-- Main Content -->
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Core Concepts -->
          <div class="space-y-4">
            <!-- <h2 class="text-xl font-semibold mb-4">Core Concepts</h2> -->
            <TableOfContents
              :sections="[
                {
                  title: 'Core Concepts',
                  items:
                    sections.find((s) => s.title === 'Core Concepts')?.items ||
                    [],
                },
              ]"
              @item-click="handleItemClick"
            />
          </div>

          <!-- Development Guides -->
          <div class="space-y-4">
            <!-- <h2 class="text-xl font-semibold mb-4">Development Guides</h2> -->
            <TableOfContents
              :sections="[
                {
                  title: 'Development',
                  items:
                    sections.find((s) => s.title === 'Development Guides')
                      ?.items || [],
                },
              ]"
              @item-click="handleItemClick"
            />
          </div>
        </div>

        <!-- Additional Sections -->
        <div class="mt-8 grid md:grid-cols-2 gap-8">
          <!-- DevOps & Deployment -->
          <div class="space-y-4">
            <!-- <h2 class="text-xl font-semibold mb-4">DevOps & Deployment</h2> -->
            <TableOfContents
              :sections="[
                {
                  title: 'Architecture',
                  items:
                    sections.find((s) => s.title === 'DevOps')?.items || [],
                },
              ]"
              @item-click="handleItemClick"
            />
          </div>

          <!-- Best Practices -->
          <div class="space-y-4">
            <!-- <h2 class="text-xl font-semibold mb-4">Best Practices</h2> -->
            <TableOfContents
              :sections="[
                {
                  title: 'Best Practices',
                  items:
                    sections.find((s) => s.title === 'Best Practices')?.items ||
                    [],
                },
              ]"
              @item-click="handleItemClick"
            />
          </div>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  docsService,
  type TableOfContentsSection,
} from "@/services/docs.service";
import CommandPalette from "@/components/CommandPalette.vue";
import TableOfContents from "@/components/TableOfContents.vue";

const router = useRouter();
const sections = ref<TableOfContentsSection[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showCommandPalette = ref(false);

// Combine all topics for search
const allTopics = computed(() =>
  sections.value.flatMap((section) => section.items)
);

// Navigation handler
const handleItemClick = (path: string) => {
  router.push(path);
};

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

onMounted(async () => {
  try {
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    error.value = "Error fetching documents";
    console.error("Error fetching documents:", err);
  } finally {
    loading.value = false;
  }
});
</script>
