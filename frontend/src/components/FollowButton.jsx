import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { followAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FollowButton = ({ userId, username, onFollowChange }) => {
    const { user } = useAuth();
    const showToast = useToast();
    const [followStatus, setFollowStatus] = useState({
        isFollowing: false,
        isFollower: false,
        isMutual: false
    });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ followerCount: 0, followingCount: 0 });

    useEffect(() => {
        if (user && userId && user.id !== userId) {
            fetchFollowStatus();
            fetchStats();
        }
    }, [userId, user]);

    const fetchFollowStatus = async () => {
        try {
            const response = await followAPI.getFollowStatus(userId);
            setFollowStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch follow status:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await followAPI.getFollowStats(userId);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            showToast('Bạn cần đăng nhập để theo dõi', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (followStatus.isFollowing) {
                await followAPI.unfollowUser(userId);
                setFollowStatus(prev => ({ ...prev, isFollowing: false, isMutual: false }));
                setStats(prev => ({ ...prev, followerCount: prev.followerCount - 1 }));
            } else {
                await followAPI.followUser(userId);
                setFollowStatus(prev => ({ 
                    ...prev, 
                    isFollowing: true,
                    isMutual: prev.isFollower 
                }));
                setStats(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
            }
            if (onFollowChange) onFollowChange();
        } catch (error) {
            showToast(error.response?.data?.error || 'Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button for own profile
    if (!user || String(user.id) === String(userId)) {
        return (
            <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    <span>{stats.followerCount} Followers</span>
                </div>
                <div className="flex items-center gap-1">
                    <UserMinus className="w-4 h-4" />
                    <span>{stats.followingCount} Following</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    <span>{stats.followerCount} Followers</span>
                </div>
                <div className="flex items-center gap-1">
                    <UserMinus className="w-4 h-4" />
                    <span>{stats.followingCount} Following</span>
                </div>
            </div>

            {/* Follow Button */}
            <button
                onClick={handleFollow}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    followStatus.isMutual
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                        : followStatus.isFollowing
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-50`}
            >
                {followStatus.isMutual ? (
                    <>
                        <UserCheck className="w-4 h-4" />
                        <span>Bạn bè</span>
                    </>
                ) : followStatus.isFollowing ? (
                    <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                    </>
                )}
            </button>


        </div>
    );
};

export default FollowButton;
