import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';

const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
];

function avatarColor(name) {
    if (!name) return AVATAR_COLORS[0];
    let h = 0;
    for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    return `${Math.floor(diff / 86400)} ngày`;
}

export default function ChatWidget() {
    const { user } = useAuth();

    // Panel states: 'closed' | 'list' | 'chat'
    const [panel, setPanel] = useState('closed');
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null); // { id, username, avatar }
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [loadingConvs, setLoadingConvs] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    // Fetch unread count (always polling when widget closed)
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await messageAPI.getUnreadCount();
            setUnreadTotal(res.data || 0);
        } catch { /* ignore */ }
    }, []);

    // Fetch conversations list
    const fetchConversations = useCallback(async () => {
        setLoadingConvs(true);
        try {
            const res = await messageAPI.getConversations();
            setConversations(res.data || []);
        } catch (e) {
            console.error('Failed to fetch conversations:', e);
        } finally {
            setLoadingConvs(false);
        }
    }, []);

    // Fetch messages for active conversation
    const fetchMessages = useCallback(async (partnerId) => {
        try {
            const res = await messageAPI.getMessages(partnerId);
            setMessages(res.data || []);
        } catch (e) {
            console.error('Failed to fetch messages:', e);
        }
    }, []);

    // Initial unread count + poll every 15s
    useEffect(() => {
        if (!user) return;
        fetchUnreadCount();
        const t = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(t);
    }, [user, fetchUnreadCount]);

    // When panel opens to 'list', load conversations
    useEffect(() => {
        if (panel === 'list') {
            fetchConversations();
        }
    }, [panel, fetchConversations]);

    // When a chat is opened, load messages and poll
    useEffect(() => {
        if (panel === 'chat' && activeConv) {
            setLoadingMsgs(true);
            fetchMessages(activeConv.id).finally(() => setLoadingMsgs(false));
            // Mark all read from this sender
            messageAPI.markAllAsReadFromSender(activeConv.id).catch(() => {});
            // Poll messages every 5s
            pollRef.current = setInterval(() => {
                fetchMessages(activeConv.id);
            }, 5000);
            return () => clearInterval(pollRef.current);
        } else {
            clearInterval(pollRef.current);
        }
    }, [panel, activeConv, fetchMessages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const openChat = (conv) => {
        setActiveConv(conv);
        setPanel('chat');
        setMessages([]);
    };

    // Expose global open function for use from other pages (e.g. profile "Nhắn tin" button)
    useEffect(() => {
        window.__openChat = (conv) => {
            openChat(conv);
        };
        return () => { delete window.__openChat; };
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !activeConv || sending) return;
        setSending(true);
        const content = input.trim();
        setInput('');
        try {
            await messageAPI.sendMessage(activeConv.id, content);
            await fetchMessages(activeConv.id);
        } catch (e) {
            console.error('Send failed:', e);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleWidget = () => {
        if (panel === 'closed') {
            setPanel('list');
            setUnreadTotal(0);
        } else {
            setPanel('closed');
            setActiveConv(null);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">

            {/* ---- Chat panel ---- */}
            {panel !== 'closed' && (
                <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                     style={{ height: '440px' }}>

                    {/* Panel header */}
                    <div className="bg-primary-600 px-4 py-3 flex items-center gap-3 text-white flex-shrink-0">
                        {panel === 'chat' && (
                            <button
                                onClick={() => { setPanel('list'); setActiveConv(null); fetchConversations(); }}
                                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div className="flex-1">
                            {panel === 'list'
                                ? <span className="font-bold text-base">Tin nhắn</span>
                                : <span className="font-semibold text-sm">{activeConv?.username}</span>
                            }
                        </div>
                        <button
                            onClick={toggleWidget}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Conversations list */}
                    {panel === 'list' && (
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {loadingConvs ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                    <MessageCircle className="h-10 w-10 opacity-30" />
                                    <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                                </div>
                            ) : (
                                conversations.map(conv => {
                                    const grad = avatarColor(conv.username);
                                    const isUnread = conv.unreadCount > 0;
                                    return (
                                        <button
                                            key={conv.userId}
                                            onClick={() => openChat({ id: conv.userId, username: conv.username, isMutual: conv.isMutualFollow })}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {conv.username?.charAt(0).toUpperCase()}
                                                </div>
                                                {!conv.isMutualFollow && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center" title="Người lạ">
                                                        <AlertCircle className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <p className="font-semibold text-sm text-slate-800 truncate">{conv.username}</p>
                                                    {!conv.isMutualFollow && (
                                                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Người lạ</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                                            </div>
                                            <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.lastMessageTime)}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Chat messages */}
                    {panel === 'chat' && (
                        <>
                            {/* Stranger warning banner */}
                            {activeConv?.isMutual === false && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-200">
                                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    <p className="text-xs text-amber-700">Người dùng này chưa theo dõi bạn lại</p>
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-slate-50">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <p className="text-xs">Bắt đầu cuộc trò chuyện với {activeConv?.username}</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMine = String(msg.senderId) === String(user.id);
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                                                    isMine
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            <div className="px-3 py-2 border-t border-slate-200 flex gap-2 bg-white flex-shrink-0">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || sending}
                                    className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-full transition-colors flex-shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ---- Floating button ---- */}
            <button
                onClick={toggleWidget}
                className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
            >
                {panel !== 'closed' ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
                {panel === 'closed' && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </button>
        </div>
    );
}
