import api from './api';

const getAllOrders = async () => {
    const response = await api.get('/warehouse/orders/all');
    return response.data;
};

const getPendingOrders = async () => {
    const response = await api.get('/warehouse/orders/pending');
    return response.data;
};

const acceptOrder = async (orderId, qualityNotes) => {
    const response = await api.put(`/warehouse/orders/${orderId}/accept`, { qualityNotes });
    return response.data;
};

const rejectOrder = async (orderId, rejectionReason) => {
    const response = await api.put(`/warehouse/orders/${orderId}/reject`, { rejectionReason });
    return response.data;
};

const markForShipping = async (orderId) => {
    const response = await api.put(`/warehouse/orders/${orderId}/ship`);
    return response.data;
};

const confirmDelivery = async (orderId) => {
    const response = await api.put(`/warehouse/orders/${orderId}/deliver`);
    return response.data;
};

const getWarehouseStats = async () => {
    const response = await api.get('/warehouse/stats');
    return response.data;
};

const warehouseService = {
    getAllOrders,
    getPendingOrders,
    acceptOrder,
    rejectOrder,
    markForShipping,
    confirmDelivery,
    getWarehouseStats,
};

export default warehouseService;
