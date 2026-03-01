import axios from 'axios'

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect for auth-check or login calls
            const url = error.config?.url || ''
            if (!url.includes('/auth/me') && !url.includes('/auth/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)
