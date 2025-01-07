# Frontend Components Documentation

## 1. Smart Components (Container Components)

### ContentManager.vue

```vue
<script setup lang="ts">
import { useContentStore } from '@/stores/content';
import { storeToRefs } from 'pinia';

const contentStore = useContentStore();
const { contents, loading } = storeToRefs(contentStore);
</script>
```

### TopicManager.vue

```vue
<script setup lang="ts">
import { useTopicStore } from '@/stores/topic';
import { storeToRefs } from 'pinia';

const topicStore = useTopicStore();
const { topics, loading } = storeToRefs(topicStore);
</script>
```

## 2. Presentational Components

### ContentCard.vue

```vue
<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  status: string;
  difficulty: string;
}>();

defineEmits<{
  (e: 'publish'): void;
  (e: 'edit'): void;
}>();
</script>
```

### ContentEditor.vue

```vue
<script setup lang="ts">
defineProps<{
  initialContent?: string;
  mode: 'create' | 'edit';
}>();

defineEmits<{
  (e: 'save', content: string): void;
  (e: 'cancel'): void;
}>();
</script>
```

## 3. Layout Components

### AppHeader.vue

- Main navigation
- User profile menu
- Search functionality

### AppSidebar.vue

- Category navigation
- Topic filters
- Quick actions

## 4. Common Components

### LoadingSpinner.vue

### ErrorMessage.vue

### ConfirmDialog.vue

### Pagination.vue
