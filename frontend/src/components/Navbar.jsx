import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { BookOpen, LogOut, User, Settings, ChevronDown, Lock, Users, MessageCircle, Palette, Volume2, VolumeX } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { theme, setTheme, volumeMap, setVolume } = useTheme();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showThemePanel, setShowThemePanel] = useState(false);
    const dropdownRef = useRef(null);
    const prevVolRef = useRef({ tet: 0.22, trungthu: 0.22, giangsinh: 0.22 });

    const toggleMute = (key) => {
        const vol = volumeMap?.[key] ?? 0.22;
        if (vol > 0) { prevVolRef.current[key] = vol; setVolume(key, 0); }
        else { setVolume(key, prevVolRef.current[key] || 0.22); }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <BookOpen className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            BlogHub
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                        >
                            Blogs
                        </Link>

                        {user && (
                            <>
                                <Link
                                    to="/following"
                                    className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Following</span>
                                </Link>
                                <Link
                                    to="/users"
                                    className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Mọi người</span>
                                </Link>
                                <Link
                                    to="/messages"
                                    className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Tin nhắn</span>
                                </Link>
                            </>
                        )}

                        {user ? (
                            <>
                                {(isAdmin() || user?.role === 'EDITOR') && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>{isAdmin() ? 'Dashboard' : 'My Blogs'}</span>
                                        </Link>
                                        {isAdmin() && (
                                            <Link
                                                to="/admin/users"
                                                className="flex items-center space-x-2 text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                            >
                                                <User className="h-4 w-4" />
                                                <span>Users</span>
                                            </Link>
                                        )}
                                    </>
                                )}

                                {/* Notification Bell */}
                                <NotificationBell />

                                <div className="relative pl-4 border-l border-slate-200" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all duration-200"
                                    >
                                        <User className="h-4 w-4 text-primary-600" />
                                        <span className="text-sm font-medium text-slate-700">
                                            {user.username}
                                        </span>
                                        {isAdmin() && (
                                            <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                        {user?.role === 'EDITOR' && (
                                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                                Editor
                                            </span>
                                        )}
                                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${
                                            showDropdown ? 'rotate-180' : ''
                                        }`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                            <Link
                                                to={`/profile/${user.id}`}
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <User className="h-4 w-4" />
                                                <span className="text-sm font-medium">Trang cá nhân</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowChangePasswordModal(true);
                                                    setShowDropdown(false);
                                                }}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Lock className="h-4 w-4" />
                                                <span className="text-sm font-medium">Đổi mật khẩu</span>
                                            </button>

                                            {/* Theme Picker */}
                                            <div className="border-t border-slate-100 my-1" />
                                            <button
                                                onClick={() => setShowThemePanel(p => !p)}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Palette className="h-4 w-4" />
                                                <span className="text-sm font-medium flex-1">Cài đặt giao diện</span>
                                                <span style={{ fontSize: 16 }}>{THEMES[theme]?.icon}</span>
                                                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showThemePanel ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showThemePanel && (
                                                <div className="px-3 pb-3 pt-1">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Giao diện</p>
                                                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                                                        {['default', 'dark'].map(key => {
                                                            const info = THEMES[key];
                                                            const active = theme === key;
                                                            return (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => setTheme(key)}
                                                                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                                                                        active
                                                                            ? 'bg-slate-100 border-2 border-sky-400 shadow-md'
                                                                            : 'bg-slate-50 border-2 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    <span style={{ fontSize: 20 }}>{info.icon}</span>
                                                                    <span className="text-[11px] font-semibold text-slate-700">{info.label}</span>
                                                                    {active && <span className="text-[9px] text-sky-500 font-bold">✓ đang dùng</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex-1 h-px bg-slate-200" />
                                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">🎵 Theo mùa</span>
                                                        <div className="flex-1 h-px bg-slate-200" />
                                                    </div>
                                                    {['tet', 'trungthu', 'giangsinh'].map(key => {
                                                        const info  = THEMES[key];
                                                        const active = theme === key;
                                                        const vol   = volumeMap?.[key] ?? 0.22;
                                                        const muted = vol === 0;
                                                        return (
                                                            <div
                                                                key={key}
                                                                className={`mb-2 rounded-xl overflow-hidden transition-all duration-150 ${
                                                                    active
                                                                        ? 'bg-slate-100 border-2 border-sky-400 shadow-md'
                                                                        : 'bg-slate-50 border border-slate-200'
                                                                }`}
                                                            >
                                                                <button
                                                                    onClick={() => setTheme(key)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-left"
                                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                                >
                                                                    <span style={{ fontSize: 17 }}>{info.icon}</span>
                                                                    <span className="text-xs font-semibold text-slate-700 flex-1">{info.label}</span>
                                                                    {active && <span className="text-[10px] font-bold text-sky-500 bg-slate-200 px-1.5 py-0.5 rounded-full">✓</span>}
                                                                </button>
                                                                <div className="flex items-center gap-1.5 px-3 pb-2.5">
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); toggleMute(key); }}
                                                                        className={`flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-slate-200 ${muted ? 'text-slate-400' : 'text-sky-500'}`}
                                                                        title={muted ? 'Bật âm' : 'Tắt âm'}
                                                                        style={{ flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                                                    >
                                                                        {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                                                    </button>
                                                                    <input
                                                                        type="range" min="0" max="1" step="0.01"
                                                                        value={vol}
                                                                        onChange={e => setVolume(key, parseFloat(e.target.value))}
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="flex-1"
                                                                        style={{ accentColor: '#0ea5e9', cursor: 'pointer' }}
                                                                    />
                                                                    <span className={`text-[10px] font-mono min-w-[28px] text-right rounded px-1 bg-slate-200 ${
                                                                        muted ? 'text-slate-400' : 'text-slate-600'
                                                                    }`}>
                                                                        {Math.round(vol * 100)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="border-t border-slate-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="text-sm font-medium">Đăng xuất</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Theme button for guests */}
                                <div className="relative" ref={null}>
                                    <button
                                        onClick={() => setShowThemePanel(p => !p)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                                        title="Cài đặt giao diện"
                                    >
                                        <span style={{ fontSize: 18 }}>{THEMES[theme]?.icon}</span>
                                    </button>
                                    {showThemePanel && (
                                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
                                            <div className="px-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-base">🎨</span>
                                                    <span className="text-xs font-bold text-slate-700">Cài đặt giao diện</span>
                                                </div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Giao diện</p>
                                                <div className="grid grid-cols-2 gap-1.5 mb-3">
                                                    {['default', 'dark'].map(key => {
                                                        const info = THEMES[key];
                                                        const active = theme === key;
                                                        return (
                                                            <button
                                                                key={key}
                                                                onClick={() => { setTheme(key); setShowThemePanel(false); }}
                                                                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                                                                    active
                                                                        ? 'bg-slate-100 border-2 border-sky-400 shadow-md'
                                                                        : 'bg-slate-50 border-2 border-slate-200 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                <span style={{ fontSize: 20 }}>{info.icon}</span>
                                                                <span className="text-[11px] font-semibold text-slate-700">{info.label}</span>
                                                                {active && <span className="text-[9px] text-sky-500 font-bold">✓ đang dùng</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">🎵 Theo mùa</span>
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                </div>
                                                {['tet', 'trungthu', 'giangsinh'].map(key => {
                                                    const info  = THEMES[key];
                                                    const active = theme === key;
                                                    const vol   = volumeMap?.[key] ?? 0.22;
                                                    const muted = vol === 0;
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={`mb-2 rounded-xl overflow-hidden transition-all duration-150 ${
                                                                active
                                                                    ? 'bg-slate-100 border-2 border-sky-400 shadow-md'
                                                                    : 'bg-slate-50 border border-slate-200'
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={() => { setTheme(key); setShowThemePanel(false); }}
                                                                className="flex items-center gap-2 w-full px-3 py-2 text-left"
                                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                <span style={{ fontSize: 17 }}>{info.icon}</span>
                                                                <span className="text-xs font-semibold text-slate-700 flex-1">{info.label}</span>
                                                                {active && <span className="text-[10px] font-bold text-sky-500 bg-slate-200 px-1.5 py-0.5 rounded-full">✓</span>}
                                                            </button>
                                                            <div className="flex items-center gap-1.5 px-3 pb-2.5">
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); toggleMute(key); }}
                                                                    className={`flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-slate-200 ${muted ? 'text-slate-400' : 'text-sky-500'}`}
                                                                    title={muted ? 'Bật âm' : 'Tắt âm'}
                                                                    style={{ flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                                                >
                                                                    {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                                                </button>
                                                                <input
                                                                    type="range" min="0" max="1" step="0.01"
                                                                    value={vol}
                                                                    onChange={e => setVolume(key, parseFloat(e.target.value))}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="flex-1"
                                                                    style={{ accentColor: '#0ea5e9', cursor: 'pointer' }}
                                                                />
                                                                <span className={`text-[10px] font-mono min-w-[28px] text-right rounded px-1 bg-slate-200 ${
                                                                    muted ? 'text-slate-400' : 'text-slate-600'
                                                                }`}>
                                                                    {Math.round(vol * 100)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to="/login"
                                    className="text-slate-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
        </nav>
    );
};

export default Navbar;
