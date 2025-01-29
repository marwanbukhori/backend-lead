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
          <!-- <button
            @click="openCreateModal"
            class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              />
            </svg>
            <span>New Document</span>
          </button> -->
          <!-- <button
            @click="openUploadModal"
            class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"
              />
            </svg>
            <span>Upload MD</span>
          </button> -->
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
            <h2 class="text-lg font-semibold mb-4">Filter by Categories</h2>
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

          <!-- class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
            :class="{ 'bg-yellow-100': showBookmarkedOnly }"
             -->
          <!-- Content Sections -->
          <div class="space-y-12">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold">Reading List</h2>
              <div class="flex items-center gap-4">
                <button
                  @click="openCreateModal"
                  class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    />
                  </svg>
                  <span>Create</span>
                </button>
                <button
                  @click="openUploadModal"
                  class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"
                    />
                  </svg>
                  <span>Upload</span>
                </button>
              </div>
            </div>

            <div
              v-for="section in filteredSections"
              :key="section.id"
              :id="section.id"
              class="space-y-6"
            >
              <h2 class="text-lg font-semibold mb-4">{{ section.title }}</h2>
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
                    <div class="flex items-center gap-2">
                      <button
                        @click="handleEditDocument(item)"
                        class="text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <svg
                          class="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                          />
                        </svg>
                      </button>
                      <button
                        @click="handleToggleBookmark(item)"
                        class="text-gray-400 hover:text-yellow-500"
                        :class="{ 'text-yellow-500': item.isBookmarked }"
                        title="Bookmark"
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
                      <button
                        @click="handleDeleteDocument(item)"
                        class="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg
                          class="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="mt-2 text-sm text-gray-600">
                    {{ item.description }}
                  </p>
                  <p class="mt-2 text-sm text-gray-600">
                    {{ item.created_at }}
                  </p>
                  <div class="mt-3 flex items-center justify-between">
                    <div class="flex flex-wrap gap-2">
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
    </div>

    <!-- Command Palette -->
    <CommandPalette
      v-if="showCommandPalette"
      :topics="allTopics"
      @close="closeCommandPalette"
    />

    <!-- Create/Edit Document Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">
            {{ newDocument.id ? "Edit Document" : "Create New Document" }}
          </h2>
          <button
            @click="closeModals"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleSubmitDocument" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <input
              v-model="newDocument.title"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Category</label
            >
            <select
              v-model="newDocument.categoryId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              required
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Content (Markdown)</label
            >
            <textarea
              v-model="newDocument.content"
              rows="10"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              required
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Tags (comma separated)</label
            >
            <input
              v-model="newDocument.tags"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="closeModals"
              class="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              {{ newDocument.id ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Upload Markdown File</h2>
          <button
            @click="closeModals"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleFileUpload" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Category</label
            >
            <select
              v-model="uploadFile.categoryId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              required
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Markdown File</label
            >
            <input
              type="file"
              accept=".md"
              @change="handleFileSelect"
              class="mt-1 block w-full"
              required
            />
          </div>
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="closeModals"
              class="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-500"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showNotificationModal"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div
        class="rounded-lg p-4 shadow-lg"
        :class="{
          'bg-gray-900 text-white': notificationStatus === 'success',
          'bg-red-600 text-white': notificationStatus === 'error',
        }"
      >
        <p>{{ notificationMessage }}</p>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Confirm Delete</h2>
          <button
            @click="showConfirmModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-gray-600">
          Are you sure you want to delete this document?
        </p>
        <div class="mt-4 flex justify-end gap-4">
          <button
            type="button"
            @click="showConfirmModal = false"
            class="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  docsService,
  type TableOfContentsSection,
  type TableOfContentsItem,
  type Category,
} from "@/services/docs.service";
import { apiClient } from "@/api/client";
import CommandPalette from "@/components/CommandPalette.vue";
import TableOfContents from "@/components/TableOfContents.vue";

const router = useRouter();
const sections = ref<TableOfContentsSection[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showCommandPalette = ref(false);
const showBookmarkedOnly = ref(false);
const selectedCategories = ref<Set<string>>(new Set());
const showCreateModal = ref(false);
const showUploadModal = ref(false);
const categories = ref<Category[]>([]);

// Form states
const newDocument = ref({
  id: "",
  title: "",
  content: "",
  categoryId: "",
  tags: "",
});

const uploadFile = ref({
  categoryId: "",
  file: null as File | null,
});

// Add these refs after other refs
const showNotificationModal = ref(false);
const notificationMessage = ref("");
const notificationStatus = ref<"success" | "error">("success");
const showConfirmModal = ref(false);
const pendingDeleteItem = ref<TableOfContentsItem | null>(null);

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
  sections.value.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      path: item.path.startsWith("/")
        ? `/docs${item.path}`
        : `/docs/${item.path}`,
    }))
  )
);

// Navigation handlers
const handleItemClick = (path: string) => {
  // Ensure path starts with /docs
  const normalizedPath = path.startsWith("/")
    ? `/docs${path}`
    : `/docs/${path}`;
  router.push(normalizedPath);
};

const handleCategoryClick = (category: string) => {
  router.push(`/categories/${category.toLowerCase()}`);
};

const handleToggleBookmark = async (item: TableOfContentsItem) => {
  try {
    if (item.isBookmarked) {
      await docsService.removeBookmark(item.id);
      showNotification("Bookmark removed successfully");
    } else {
      await docsService.addBookmark(item.id);
      showNotification("Bookmark added successfully");
    }
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    showNotification("Error updating bookmark. Please try again.", "error");
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

// Modal handlers
const openCreateModal = () => {
  showCreateModal.value = true;
  // Reset form for new document
  newDocument.value = {
    id: "",
    title: "",
    content: "",
    categoryId: "",
    tags: "",
  };
};

const openUploadModal = () => {
  showUploadModal.value = true;
  uploadFile.value = {
    categoryId: "",
    file: null,
  };
};

const closeModals = () => {
  showCreateModal.value = false;
  showUploadModal.value = false;
};

// Form handlers
const handleSubmitDocument = async () => {
  try {
    const documentData = {
      title: newDocument.value.title,
      content: newDocument.value.content,
      categoryId: newDocument.value.categoryId,
      tags: newDocument.value.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sections: [
        {
          title: newDocument.value.content.split("\n")[0].replace("# ", ""),
          content: newDocument.value.content,
          level: 1,
          order_index: 0,
        },
      ],
    };

    if (newDocument.value.id) {
      await docsService.updateDocument(newDocument.value.id, documentData);
      showNotification("Document updated successfully");
    } else {
      await docsService.createDocument(documentData);
      showNotification("Document created successfully");
    }

    closeModals();
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    console.error("Error saving document:", err);
    showNotification("Error saving document. Please try again.", "error");
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    uploadFile.value.file = input.files[0];
  }
};

const handleFileUpload = async () => {
  if (!uploadFile.value.file) return;

  try {
    const content = await uploadFile.value.file.text();
    await docsService.createDocument({
      title: uploadFile.value.file.name.replace(".md", ""),
      content,
      categoryId: uploadFile.value.categoryId,
      tags: [],
    });
    showNotification("Document uploaded successfully");
    closeModals();
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    console.error("Error uploading document:", err);
    showNotification("Error uploading document. Please try again.", "error");
  }
};

const handleEditDocument = async (item: TableOfContentsItem) => {
  try {
    const doc = await docsService.getDocById(item.id);
    // Pre-fill the form
    newDocument.value = {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      categoryId: doc.category.id,
      tags: Array.isArray(doc.tags) ? doc.tags.join(", ") : doc.tags,
    };
    showCreateModal.value = true;
  } catch (err) {
    console.error("Error fetching document for edit:", err);
    showNotification("Error fetching document. Please try again.", "error");
  }
};

const handleDeleteDocument = async (item: TableOfContentsItem) => {
  pendingDeleteItem.value = item;
  showConfirmModal.value = true;
};

const confirmDelete = async () => {
  if (!pendingDeleteItem.value) return;

  try {
    await docsService.deleteDocument(pendingDeleteItem.value.id);
    showNotification("Document deleted successfully");
    sections.value = await docsService.getTableOfContents();
  } catch (err) {
    console.error("Error deleting document:", err);
    showNotification("Error deleting document. Please try again.", "error");
  } finally {
    showConfirmModal.value = false;
    pendingDeleteItem.value = null;
  }
};

// Add notification handlers
const showNotification = (
  message: string,
  status: "success" | "error" = "success"
) => {
  notificationMessage.value = message;
  notificationStatus.value = status;
  showNotificationModal.value = true;
  setTimeout(() => {
    showNotificationModal.value = false;
  }, 3000);
};

onMounted(async () => {
  try {
    // Fetch both categories and table of contents in parallel
    const [categoriesData, sectionsData] = await Promise.all([
      docsService.getCategories(),
      docsService.getTableOfContents(),
    ]);
    categories.value = categoriesData;
    sections.value = sectionsData;
  } catch (err) {
    error.value = "Error fetching documents";
    console.error("Error fetching documents:", err);
  } finally {
    loading.value = false;
  }
});
</script>
