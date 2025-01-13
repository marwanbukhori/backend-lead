<template>
  <div class="markdown-content prose prose-slate max-w-none">
    <div v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const props = defineProps<{
  content: string;
}>();

const renderedContent = ref("");

// Configure marked with syntax highlighting
const renderer = new marked.Renderer();

renderer.code = function (code: string, language?: string) {
  const validLanguage =
    language && hljs.getLanguage(language) ? language : "plaintext";
  const highlighted = hljs.highlight(code, { language: validLanguage }).value;
  return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
};

marked.setOptions({ renderer });

// Render markdown content
const renderContent = async (content: string) => {
  try {
    renderedContent.value = await marked.parse(content);
  } catch (error) {
    console.error("Error parsing markdown:", error);
    renderedContent.value = "Error rendering content";
  }
};

// Watch for content changes
watch(
  () => props.content,
  async (newContent) => {
    await renderContent(newContent);
  },
  { immediate: true }
);

// Initial render
onMounted(async () => {
  await renderContent(props.content);
});
</script>

<style>
.markdown-content {
  @apply px-6 py-4;
}

.markdown-content pre {
  @apply p-4 rounded-lg bg-gray-50 overflow-x-auto;
}

.markdown-content code {
  @apply text-sm font-mono;
}

.markdown-content h1 {
  @apply text-3xl font-bold mb-6;
}

.markdown-content h2 {
  @apply text-2xl font-semibold mt-8 mb-4;
}

.markdown-content h3 {
  @apply text-xl font-semibold mt-6 mb-3;
}

.markdown-content p {
  @apply mb-4 leading-relaxed;
}

.markdown-content ul {
  @apply list-disc list-inside mb-4 space-y-2;
}

.markdown-content ol {
  @apply list-decimal list-inside mb-4 space-y-2;
}

.markdown-content a {
  @apply text-gray-900 hover:text-black underline;
}

.markdown-content blockquote {
  @apply border-l-4 border-gray-200 pl-4 italic my-4 text-gray-700;
}

.markdown-content table {
  @apply w-full border-collapse mb-4;
}

.markdown-content th,
.markdown-content td {
  @apply border border-gray-200 px-4 py-2;
}

.markdown-content th {
  @apply bg-gray-50 font-semibold;
}

@media (max-width: 640px) {
  .markdown-content {
    @apply px-4 py-3;
  }
}
</style>
