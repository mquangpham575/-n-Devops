import axios from 'axios';

// Get API URL from environment variable
// Falls back to '/api' if not set (proxy mode)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log API URL in development
if (import.meta.env.DEV) {
    console.log('API Base URL:', baseURL);
}

// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log all errors for debugging
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.config?.headers
        });

        if (error.response?.status === 401) {
            // Don't redirect if it's a login or register request (user entering wrong credentials)
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                                   error.config?.url?.includes('/auth/register');
            
            // For category management, DON'T auto-redirect - let component handle it
            const isCategoryEndpoint = error.config?.url?.includes('/categories');
            
            if (!isAuthEndpoint && !isCategoryEndpoint) {
                // Only auto-redirect for non-auth, non-category endpoints
                const errorMsg = error.response?.data?.message || 'Phiên đăng nhập hết hạn';
                console.error('Auto-redirecting to login:', errorMsg);
                
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }, 2000);
            }
        }
        return Promise.reject(error);
    }
);

// User API
export const userAPI = {
    getAllUsers: () => api.get('/users'),
    getUserById: (id) => api.get(`/users/${id}`),
    getMyProfile: () => api.get('/users/me'),
    changePassword: (data) => api.post('/users/change-password', data),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    updateShowEmail: (showEmail) => api.put('/users/me/show-email', { showEmail })
};

// Category API
export const categoryAPI = {
    getAllCategories: () => api.get('/categories'),
    getActiveCategories: () => api.get('/categories/active'),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Follow API
export const followAPI = {
    followUser: (userId) => api.post(`/follow/${userId}`),
    unfollowUser: (userId) => api.delete(`/follow/${userId}`),
    getFollowStatus: (userId) => api.get(`/follow/${userId}/status`),
    getFollowers: (userId) => api.get(`/follow/${userId}/followers`),
    getFollowing: (userId) => api.get(`/follow/${userId}/following`),
    getFollowStats: (userId) => api.get(`/follow/${userId}/stats`),
    getFollowingIds: () => api.get('/follow/following-ids')
};

// Notification API
export const notificationAPI = {
    getAllNotifications: () => api.get('/notifications'),
    getUnreadNotifications: () => api.get('/notifications/unread'),
    getUnreadCount: () => api.get('/notifications/unread/count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteReadNotifications: () => api.delete('/notifications/read')
};

// Message API
export const messageAPI = {
    sendMessage: (receiverId, content) => api.post(`/messages/${receiverId}`, { content }),
    getMessages: (userId) => api.get(`/messages/${userId}`),
    getConversations: () => api.get('/messages/conversations'),
    markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
    markAllAsReadFromSender: (senderId) => api.put(`/messages/read-all/${senderId}`),
    getUnreadCount: () => api.get('/messages/unread/count')
};

// Blog API extensions
export const blogAPI = {
    getFollowingFeed: () => api.get('/blogs/following'),
    getBlogsByAuthor: (authorId) => api.get('/blogs', { params: { authorId } }),
    getAll: (params) => api.get('/blogs', { params })
};

export default api;
