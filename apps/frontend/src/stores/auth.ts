import { defineStore } from 'pinia'
import axios from 'axios'

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      })

      this.token = response.data.access_token
      this.user = response.data.user
      localStorage.setItem('token', this.token as string)

      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    },

    async register(email: string, password: string, name: string) {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        password,
        name,
      })

      this.token = response.data.access_token
      this.user = response.data.user
      localStorage.setItem('token', this.token as string)

      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    },

    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },

    async fetchProfile() {
      if (!this.token) return

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`)
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
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.fetchProfile()
      }
    },
  },
})
