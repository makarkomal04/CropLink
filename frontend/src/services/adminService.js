import api from './api';

const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

const verifyFarmer = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/verify`);
    return response.data;
};

const deactivateUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

const getPendingProducts = async () => {
    const response = await api.get('/admin/products/pending');
    return response.data;
};

const approveProduct = async (productId) => {
    const response = await api.put(`/admin/products/${productId}/approve`);
    return response.data;
};

const rejectProduct = async (productId) => {
    const response = await api.put(`/admin/products/${productId}/reject`);
    return response.data;
};

const adminService = {
    getAllUsers,
    verifyFarmer,
    deactivateUser,
    getPendingProducts,
    approveProduct,
    rejectProduct,
};

export default adminService;
