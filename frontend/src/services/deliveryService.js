import api from './api';

const getMyDeliveries = async () => {
    const response = await api.get('/delivery/my-orders');
    return response.data;
};

const getMyCompletedDeliveries = async () => {
    const response = await api.get('/delivery/my-completed');
    return response.data;
};

const markDelivered = async (orderId) => {
    const response = await api.put(`/delivery/orders/${orderId}/deliver`);
    return response.data;
};

const deliveryService = {
    getMyDeliveries,
    getMyCompletedDeliveries,
    markDelivered,
};

export default deliveryService;
