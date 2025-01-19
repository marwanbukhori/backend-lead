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
        <div class="space-y-8">
          <!-- Dashboard Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h3 class="text-sm font-medium text-gray-500">
                Total Categories
              </h3>
              <p class="mt-2 text-3xl font-semibold">{{ sections.length }}</p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h3 class="text-sm font-medium text-gray-500">Total Documents</h3>
              <p class="mt-2 text-3xl font-semibold">
                {{
                  sections.reduce(
                    (sum, section) => sum + section.items.length,
                    0
                  )
                }}
              </p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h3 class="text-sm font-medium text-gray-500">Bookmarked</h3>
              <p class="mt-2 text-3xl font-semibold">
                {{
                  sections.reduce(
                    (sum, section) =>
                      sum +
                      section.items.filter((item) => item.isBookmarked).length,
                    0
                  )
                }}
              </p>
            </div>
            <div class="bg-white p-4 rounded-lg border shadow-sm">
              <h3 class="text-sm font-medium text-gray-500">
                Selected Categories
              </h3>
              <p class="mt-2 text-3xl font-semibold">
                {{ selectedCategories.size }}
              </p>
            </div>
          </div>

          <!-- Categories TOC -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-4">Categories</h2>
            <ul class="flex flex-wrap gap-4">
              <li v-for="section in sections" :key="section.id">
                <button
                  @click="toggleCategory(section.id)"
                  class="px-3 py-1 rounded-full transition-colors"
                  :class="[
                    selectedCategories.has(section.id)
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900',
                  ]"
                >
                  {{ section.title }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Content Sections -->
          <div class="space-y-12">
            <div
              v-for="section in filteredSections"
              :key="section.id"
              :id="section.id"
              class="space-y-6"
            >
              <h2 class="text-2xl font-bold">{{ section.title }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="item in section.items"
                  :key="item.id"
                  class="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between">
                    <h3 class="text-lg font-medium">
                      <a
                        href="#"
                        @click.prevent="handleItemClick(item.path)"
                        class="hover:text-blue-600"
                      >
                        {{ item.title }}
                      </a>
                    </h3>
                    <button
                      @click="handleToggleBookmark(item)"
                      class="text-gray-400 hover:text-yellow-500"
                      :class="{ 'text-yellow-500': item.isBookmarked }"
                    >
                      <svg
                        class="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p class="mt-2 text-sm text-gray-600">
                    {{ item.description }}
                  </p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="tag in item.tags"
                      :key="tag"
                      class="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-600"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
const selectedCategories = ref<Set<string>>(new Set());

// Filter sections based on bookmarks and selected categories
const filteredSections = computed(() => {
  let filtered = sections.value;

  // Filter by selected categories if any are selected
  if (selectedCategories.value.size > 0) {
    filtered = filtered.filter((section) =>
      selectedCategories.value.has(section.id)
    );
  }

  // Filter by bookmarks if enabled
  if (showBookmarkedOnly.value) {
    filtered = filtered
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.isBookmarked),
      }))
      .filter((section) => section.items.length > 0);
  }

  // Limit items to 10 per category
  return filtered.map((section) => ({
    ...section,
    items: section.items.slice(0, 10),
  }));
});

// Combine all topics for search
const allTopics = computed(() =>
  sections.value.flatMap((section) => section.items)
);

// Navigation handlers
const handleItemClick = (path: string) => {
  // Remove /docs prefix if it exists
  const cleanPath = path.replace(/^\/docs/, "");
  router.push(`/docs${cleanPath}`);
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

const scrollToCategory = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// Toggle category selection
const toggleCategory = (categoryId: string) => {
  if (selectedCategories.value.has(categoryId)) {
    selectedCategories.value.delete(categoryId);
  } else {
    selectedCategories.value.add(categoryId);
  }
  // Create a new Set to trigger reactivity
  selectedCategories.value = new Set(selectedCategories.value);
};

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
