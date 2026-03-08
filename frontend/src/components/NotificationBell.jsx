import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationAPI.getUnreadNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!showDropdown) {
            fetchNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationLink = (notification) => {
        switch (notification.type) {
            case 'NEW_POST':
                return `/blogs/${notification.relatedId}`;
            case 'COMMENT_REPLY':
                return `/blogs/${notification.relatedId}`;
            case 'NEW_FOLLOWER':
                return `/profile/${notification.actorId}`;
            case 'NEW_MESSAGE':
                return `/messages/${notification.actorId}`;
            default:
                return '#';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Thông báo</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="py-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>Không có thông báo mới</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <Link
                                                    to={getNotificationLink(notification)}
                                                    onClick={() => {
                                                        handleMarkAsRead(notification.id);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="block"
                                                >
                                                    <p className="text-sm text-slate-800 font-medium mb-1">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </Link>
                                            </div>
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-all"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - always visible */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center">
                        <Link
                            to="/notifications"
                            onClick={() => setShowDropdown(false)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Xem tất cả thông báo →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
