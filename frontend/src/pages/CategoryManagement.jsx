import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ code: '', name: '', description: '' });
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ open: false });
    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Không thể tải danh sách thể loại');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ code: '', name: '', description: '' });
        setError('');
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ code: category.code, name: category.name, description: category.description || '' });
        setError('');
        setShowModal(true);
    };

    const handleDelete = (id, name) => {
        setConfirmModal({
            open: true,
            title: `Xóa thể loại "${name}"?`,
            message: 'Thể loại này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?',
            onConfirm: async () => {
                try {
                    await categoryAPI.deleteCategory(id);
                    fetchCategories();
                    showToast(`Đã xóa thể loại “${name}”`, 'success');
                } catch (error) {
                    showToast('Không thể xóa thể loại. Có thể thể loại đang được sử dụng.', 'error');
                } finally {
                    setConfirmModal({ open: false });
                }
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.code.trim()) {
            setError('Mã thể loại không được để trống');
            return;
        }

        if (!formData.name.trim()) {
            setError('Tên thể loại không được để trống');
            return;
        }

        try {
            if (editingCategory) {
                await categoryAPI.updateCategory(editingCategory.id, formData);
            } else {
                await categoryAPI.createCategory(formData);
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user')
            });
            
            // Extract error message - short and clear
            let errorMessage = 'Không thể lưu thể loại';
            
            if (error.response?.status === 401) {
                errorMessage = '🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }, 2000);
            } else if (error.response?.status === 403) {
                errorMessage = '⛔ Chỉ ADMIN mới có quyền thực hiện thao tác này.';
            } else if (error.response?.data?.message) {
                // Clean up backend validation messages
                const backendMsg = error.response.data.message;
                if (backendMsg.includes('already exists')) {
                    if (backendMsg.includes('code')) {
                        errorMessage = `❌ Mã thể loại "${formData.code}" đã tồn tại`;
                    } else if (backendMsg.includes('name')) {
                        errorMessage = `❌ Tên thể loại "${formData.name}" đã tồn tại`;
                    } else {
                        errorMessage = '❌ ' + backendMsg;
                    }
                } else {
                    errorMessage = '❌ ' + backendMsg;
                }
            } else if (error.response?.data?.error) {
                errorMessage = '❌ ' + error.response.data.error;
            }
            
            setError(errorMessage);
            // Don't close modal or reload on error - let user see the error message
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý thể loại</h1>
                        <p className="text-gray-600 mt-2">Quản lý các thể loại bài viết</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={handleCreate}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thêm thể loại
                        </button>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên thể loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Chưa có thể loại nào
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono font-medium text-gray-900">
                                                {category.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 line-clamp-2">
                                                {category.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                category.active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {category.active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingCategory ? 'Sửa thể loại' : 'Thêm thể loại mới'}
                            </h2>
                            
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r shadow-sm">
                                    <div className="flex items-start">
                                        <span className="text-xl mr-2">⚠️</span>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã thể loại *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                        placeholder="Ví dụ: TECH, TRAVEL, FOOD"
                                        maxLength={50}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Mã viết hoa, không dấu, không khoảng trắng
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên thể loại *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: Công nghệ, Du lịch..."
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Mô tả ngắn về thể loại này..."
                                        rows={3}
                                        maxLength={500}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
}
