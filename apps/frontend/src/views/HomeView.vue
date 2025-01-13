<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Engineer's Source of Truth</h1>

      <!-- Search Command Palette Trigger -->
      <div class="mb-8 flex items-center justify-between">
        <p class="text-gray-600">
          Press <kbd class="px-2 py-1 bg-gray-100 rounded">⌘ K</kbd> to search
        </p>
        <div class="flex items-center gap-4">
          <button
            @click="toggleShowBookmarked"
            class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
            :class="{ 'bg-yellow-100': showBookmarkedOnly }"
          >
            <svg
              class="w-5 h-5"
              :class="showBookmarkedOnly ? 'text-yellow-500' : 'text-gray-500'"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span>Show Bookmarks</span>
          </button>
          <button
            @click="openCommandPalette"
            class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>Quick Search</span>
            <span class="text-sm text-gray-500">⌘K</span>
          </button>
        </div>
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
          <div
            v-for="section in filteredSections"
            :key="section.title"
            class="space-y-4"
          >
            <TableOfContents
              :sections="[section]"
              @item-click="handleItemClick"
              @category-click="handleCategoryClick"
              @toggle-bookmark="handleToggleBookmark"
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
  type TableOfContentsItem,
} from "@/services/docs.service";
import CommandPalette from "@/components/CommandPalette.vue";
import TableOfContents from "@/components/TableOfContents.vue";

const router = useRouter();
const sections = ref<TableOfContentsSection[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showCommandPalette = ref(false);
const showBookmarkedOnly = ref(false);

// Filter sections based on bookmarks
const filteredSections = computed(() => {
  if (!showBookmarkedOnly.value) return sections.value;

  return sections.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.isBookmarked),
    }))
    .filter((section) => section.items.length > 0);
});

// Combine all topics for search
const allTopics = computed(() =>
  sections.value.flatMap((section) => section.items)
);

// Navigation handlers
const handleItemClick = (path: string) => {
  router.push(path);
};

const handleCategoryClick = (category: string) => {
  router.push(`/categories/${category.toLowerCase()}`);
};

const handleToggleBookmark = async (item: TableOfContentsItem) => {
  try {
    if (item.isBookmarked) {
      await docsService.removeBookmark(item.id);
    } else {
      await docsService.addBookmark(item.id);
    }
    // Refresh the table of contents to update bookmark states
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
};

// Command palette handlers
const openCommandPalette = () => {
  showCommandPalette.value = true;
};

const closeCommandPalette = () => {
  showCommandPalette.value = false;
};

const toggleShowBookmarked = () => {
  showBookmarkedOnly.value = !showBookmarkedOnly.value;
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
