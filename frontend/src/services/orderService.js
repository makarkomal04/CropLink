import api from './api';

const createOrder = async (order) => {
    const response = await api.post('/orders', order);
    return response.data;
};

const getMyOrders = async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
};

const getStats = async () => {
    const response = await api.get('/orders/stats');
    return response.data;
};

const getOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

const orderService = {
    createOrder,
    getMyOrders,
    getStats,
    getOrders,
};

export default orderService;
