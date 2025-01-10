import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/docs/:path+',
      name: 'document',
      component: () => import('@/views/ContentView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Check if route requires auth
  if (to.meta.requiresAuth) {
    // If not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    // If authenticated but no user data, try to fetch profile
    if (!authStore.user) {
      try {
        await authStore.fetchProfile();
      } catch (error) {
        // If profile fetch fails, redirect to login
        return { name: 'login', query: { redirect: to.fullPath } };
      }
    }
  }

  // If going to login/register while already authenticated
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;
