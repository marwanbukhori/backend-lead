<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Topics</h1>
      <button class="btn btn-primary" @click="handleCreateTopic">
        Create Topic
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">Loading...</div>

    <div v-else-if="topics.length === 0" class="text-center py-8">
      No topics available.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <h2 class="text-xl font-semibold mb-2">{{ topic.title }}</h2>
        <p class="text-gray-600 mb-4">{{ topic.description }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-500">
            {{ topic.difficulty }}
          </span>
          <button
            class="btn btn-secondary text-sm"
            @click="handleViewContent(topic.id)"
          >
            View Content
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

const router = useRouter();
const topics = ref<Topic[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // TODO: Fetch topics from API
    loading.value = false;
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    loading.value = false;
  }
});

const handleCreateTopic = () => {
  // TODO: Implement topic creation
};

const handleViewContent = (id: string) => {
  router.push(`/content?topicId=${id}`);
};
</script>
