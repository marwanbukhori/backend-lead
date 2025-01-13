import { defineStore } from 'pinia'
import { apiClient } from '@/api/client'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },

  actions: {
    async login(email: string, password: string) {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })

      this.token = response.data.access_token
      this.user = response.data.user
      localStorage.setItem('token', this.token as string)

      // Set default Authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    },

    async register(email: string, password: string, name: string) {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name,
      })

      this.token = response.data.access_token
      this.user = response.data.user
      localStorage.setItem('token', this.token as string)

      // Set default Authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    },

    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete apiClient.defaults.headers.common['Authorization']
    },

    async fetchProfile() {
      if (!this.token) return

      try {
        const response = await apiClient.get('/auth/profile')
        this.user = response.data
      } catch (error) {
        this.logout()
        throw error
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.fetchProfile()
      }
    },
  },
})
