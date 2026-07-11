import axios from "axios"


const baseUrl = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "http://localhost:3000"

export const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true
})

// ── Refresh Token Interceptor ──────────────────────────────────────────────
// When any request returns 401 (access token expired), automatically
// call /api/auth/refresh to get a new access token, then retry once.
let isRefreshing = false
let refreshQueue = []

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Only intercept 401s that haven't already been retried
        if (error?.response?.status === 401 && !originalRequest._retry) {

            // Skip refresh for auth routes themselves to avoid infinite loops
            if (originalRequest.url?.includes("/api/auth/")) {
                return Promise.reject(error)
            }

            if (isRefreshing) {
                // Queue this request until refresh is done
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject })
                }).then(() => api(originalRequest))
                  .catch(() => Promise.reject(error))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                await api.post("/api/auth/refresh")
                // Flush the queued requests
                refreshQueue.forEach(({ resolve }) => resolve())
                refreshQueue = []
                return api(originalRequest)
            } catch (refreshError) {
                refreshQueue.forEach(({ reject }) => reject(refreshError))
                refreshQueue = []
                // Refresh failed — user must log in again
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        // silence
    }
}

export async function refreshToken() {
    try {
        const response = await api.post("/api/auth/refresh")
        return response.data
    } catch (err) {
        throw err
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // silence — handled by caller
    }
}