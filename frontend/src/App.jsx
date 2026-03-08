import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import SeasonDecorations from './components/SeasonDecorations';
import './themes.css';
import './themes/tet.css';
import './themes/trungthu.css';
import './themes/giangsinh.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import CategoryManagement from './pages/CategoryManagement';
import BlogForm from './components/BlogForm';
import MessagesPage from './pages/MessagesPage';
import FollowingFeedPage from './pages/FollowingFeedPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import UsersPage from './pages/UsersPage';
import ChatWidget from './components/ChatWidget';
import { useAuth } from './context/AuthContext';

function AppInner() {
    const { user } = useAuth();
    return (
        <div className="min-h-screen flex flex-col">
            {/* Season & holiday decorations on corners */}
            <SeasonDecorations />
            <Navbar />
            <main className="flex-1">
                <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<BlogListPage />} />
                        <Route path="/blogs/:id" element={<BlogDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-email" element={<EmailVerificationPage />} />

                        {/* Social Features Routes */}
                        <Route
                            path="/messages"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/messages/:userId"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/following"
                            element={
                                <ProtectedRoute>
                                    <FollowingFeedPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/create"
                            element={
                                <ProtectedRoute adminOnly>
                                    <BlogForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/edit/:id"
                            element={
                                <ProtectedRoute adminOnly>
                                    <BlogForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminUserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <ProtectedRoute adminOnly>
                                    <CategoryManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Profile & Discovery */}
                        <Route path="/profile/:userId" element={<UserProfilePage />} />
                        <Route path="/users" element={<UsersPage />} />
                    </Routes>
            </main>
            {/* Global Chat Widget (floating bottom-right) */}
            {user && <ChatWidget />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <ThemeProvider>
                    <Router>
                        <AppInner />
                    </Router>
                </ThemeProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
