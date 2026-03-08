import axios from 'axios';

// =============================================
// Base URLs từng service — cấu hình qua .env
// Docker/single-server : tất cả = '/api' (Nginx route nội bộ)
// Multi-server         : mỗi cái một URL thật riêng
// =============================================
const USER_SERVICE_URL  = import.meta.env.VITE_API_USER_SERVICE || '/api';
const BLOG_SERVICE_URL  = import.meta.env.VITE_API_BLOG_SERVICE || '/api';
const FILE_SERVICE_URL  = import.meta.env.VITE_API_FILE_SERVICE || '/api';

if (import.meta.env.DEV) {
    console.log('[API] user-service :', USER_SERVICE_URL);
    console.log('[API] blog-service :', BLOG_SERVICE_URL);
    console.log('[API] file-service :', FILE_SERVICE_URL);
}

// =============================================
// Interceptors factory — dùng chung
// =============================================
function addInterceptors(instance) {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
            });

            if (error.response?.status === 401) {
                const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                                       error.config?.url?.includes('/auth/register');
                const isCategoryEndpoint = error.config?.url?.includes('/categories');

                if (!isAuthEndpoint && !isCategoryEndpoint) {
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

    return instance;
}

// =============================================
// 3 axios instances — mỗi service một instance
// =============================================
const userApi = addInterceptors(axios.create({
    baseURL: USER_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
}));

const blogApi = addInterceptors(axios.create({
    baseURL: BLOG_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
}));

const fileApi = addInterceptors(axios.create({
    baseURL: FILE_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
}));

// =============================================
// User Service API  →  /api/auth, /api/users, /api/follow, /api/notifications, /api/messages
// =============================================
export const userAPI = {
    getAllUsers: () => userApi.get('/users'),
    getUserById: (id) => userApi.get(`/users/${id}`),
    getMyProfile: () => userApi.get('/users/me'),
    changePassword: (data) => userApi.post('/users/change-password', data),
    updateRole: (id, role) => userApi.put(`/users/${id}/role`, { role }),
    updateShowEmail: (showEmail) => userApi.put('/users/me/show-email', { showEmail })
};

export const authAPI = {
    login: (data) => userApi.post('/auth/login', data),
    register: (data) => userApi.post('/auth/register', data),
    verifyEmail: (token) => userApi.get(`/auth/verify-email?token=${token}`),
};

export const followAPI = {
    followUser: (userId) => userApi.post(`/follow/${userId}`),
    unfollowUser: (userId) => userApi.delete(`/follow/${userId}`),
    getFollowStatus: (userId) => userApi.get(`/follow/${userId}/status`),
    getFollowers: (userId) => userApi.get(`/follow/${userId}/followers`),
    getFollowing: (userId) => userApi.get(`/follow/${userId}/following`),
    getFollowStats: (userId) => userApi.get(`/follow/${userId}/stats`),
    getFollowingIds: () => userApi.get('/follow/following-ids')
};

export const notificationAPI = {
    getAllNotifications: () => userApi.get('/notifications'),
    getUnreadNotifications: () => userApi.get('/notifications/unread'),
    getUnreadCount: () => userApi.get('/notifications/unread/count'),
    markAsRead: (id) => userApi.put(`/notifications/${id}/read`),
    markAllAsRead: () => userApi.put('/notifications/read-all'),
    deleteReadNotifications: () => userApi.delete('/notifications/read')
};

export const messageAPI = {
    sendMessage: (receiverId, content) => userApi.post(`/messages/${receiverId}`, { content }),
    getMessages: (userId) => userApi.get(`/messages/${userId}`),
    getConversations: () => userApi.get('/messages/conversations'),
    markAsRead: (messageId) => userApi.put(`/messages/${messageId}/read`),
    markAllAsReadFromSender: (senderId) => userApi.put(`/messages/read-all/${senderId}`),
    getUnreadCount: () => userApi.get('/messages/unread/count')
};

// =============================================
// Blog Service API  →  /api/blogs, /api/categories, /api/comments, /api/uploads
// =============================================
export const categoryAPI = {
    getAllCategories: () => blogApi.get('/categories'),
    getActiveCategories: () => blogApi.get('/categories/active'),
    getCategoryById: (id) => blogApi.get(`/categories/${id}`),
    createCategory: (data) => blogApi.post('/categories', data),
    updateCategory: (id, data) => blogApi.put(`/categories/${id}`, data),
    deleteCategory: (id) => blogApi.delete(`/categories/${id}`)
};

export const blogAPI = {
    getAll: (params) => blogApi.get('/blogs', { params }),
    getById: (id) => blogApi.get(`/blogs/${id}`),
    create: (data) => blogApi.post('/blogs', data),
    update: (id, data) => blogApi.put(`/blogs/${id}`, data),
    delete: (id) => blogApi.delete(`/blogs/${id}`),
    getPinned: () => blogApi.get('/blogs/pinned'),
    search: (params) => blogApi.get('/blogs/search', { params }),
    getFollowingFeed: () => blogApi.get('/blogs/following'),
    getBlogsByAuthor: (authorId) => blogApi.get('/blogs', { params: { authorId } }),
    togglePin: (id) => blogApi.put(`/blogs/${id}/pin`),
    unpin: (id) => blogApi.put(`/blogs/${id}/unpin`),
    updateStatus: (id, status) => blogApi.put(`/blogs/${id}/status`, { status }),
    uploadFile: (formData) => blogApi.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const commentAPI = {
    getByBlog: (blogId) => blogApi.get(`/comments/blog/${blogId}`),
    create: (data) => blogApi.post('/comments', data),
    update: (id, data) => blogApi.put(`/comments/${id}`, data),
    delete: (id) => blogApi.delete(`/comments/${id}`),
};

// =============================================
// File Service API  →  /api/files
// =============================================
export const fileAPI = {
    upload: (formData) => fileApi.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (fileId) => fileApi.delete(`/files/${fileId}`),
    getUrl: (fileId) => fileApi.get(`/files/${fileId}`),
};

// =============================================
// Default export — giữ backward compat với code cũ còn dùng import api from 'api'
// Trỏ về userApi để không break các chỗ chưa migrate
// =============================================
export default userApi;
