<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Category Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 class="text-3xl font-bold">{{ categoryName }}</h1>
        </div>
        <p class="mt-2 text-gray-600">{{ documents.length }} documents</p>
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
        <!-- Documents List -->
        <TableOfContents
          :sections="[{ title: categoryName, items: documentItems }]"
          @item-click="handleItemClick"
          @toggle-bookmark="handleToggleBookmark"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  docsService,
  type Document,
  type TableOfContentsItem,
} from "@/services/docs.service";
import TableOfContents from "@/components/TableOfContents.vue";

const route = useRoute();
const router = useRouter();
const documents = ref<Document[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const categoryName = computed(() => {
  const category = route.params.category as string;
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const documentItems = computed(() =>
  documents.value.map((doc: Document) => ({
    id: doc.id,
    title: doc.title,
    description: doc.content.split("\n")[2] || "No description available",
    path: `/docs${doc.path}`,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    category: doc.category.name,
    isBookmarked: doc.isBookmarked,
  }))
);

const handleItemClick = (path: string) => {
  router.push(path);
};

const handleToggleBookmark = async (item: TableOfContentsItem) => {
  try {
    if (item.isBookmarked) {
      await docsService.removeBookmark(item.id);
    } else {
      await docsService.addBookmark(item.id);
    }
    // Refresh the documents to update bookmark states
    await fetchDocuments();
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
};

const fetchDocuments = async () => {
  try {
    // Get both docs and bookmarks in parallel
    const [docs, bookmarks] = await Promise.all([
      docsService.getDocsByCategory(categoryName.value),
      docsService.getBookmarks(),
    ]);

    // Create a set of bookmarked document IDs for quick lookup
    const bookmarkedDocIds = new Set(bookmarks.map((b) => b.documentId));

    // Update documents with bookmark state
    documents.value = docs.map((doc) => ({
      ...doc,
      isBookmarked: bookmarkedDocIds.has(doc.id),
    }));
  } catch (err) {
    error.value = "Error fetching documents";
    console.error("Error fetching documents:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDocuments);
</script>
