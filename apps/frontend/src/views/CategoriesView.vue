<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Categories</h1>
      <button class="btn btn-primary" @click="handleCreateCategory">
        Create Category
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">Loading...</div>

    <div v-else-if="categories.length === 0" class="text-center py-8">
      No categories available.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <h2 class="text-xl font-semibold mb-2">{{ category.name }}</h2>
        <p class="text-gray-600 mb-4">{{ category.description }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-500">
            {{ category.topicsCount }} Topics
          </span>
          <button
            class="btn btn-secondary text-sm"
            @click="handleViewTopics(category.id)"
          >
            View Topics
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Category {
  id: string;
  name: string;
  description: string;
  topicsCount: number;
}

const router = useRouter();
const categories = ref<Category[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // TODO: Fetch categories from API
    loading.value = false;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    loading.value = false;
  }
});

const handleCreateCategory = () => {
  // TODO: Implement category creation
};

const handleViewTopics = (id: string) => {
  router.push(`/topics?categoryId=${id}`);
};
</script>
