import api from './api';

const getAcceptedOrders = async () => {
    const response = await api.get('/shipment/orders');
    return response.data;
};

const getDeliveryBoys = async () => {
    const response = await api.get('/shipment/delivery-boys');
    return response.data;
};

const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
    const response = await api.put(`/shipment/orders/${orderId}/assign`, { deliveryBoyId });
    return response.data;
};

const markShipped = async (orderId) => {
    const response = await api.put(`/shipment/orders/${orderId}/ship`);
    return response.data;
};

const shipmentService = {
    getAcceptedOrders,
    getDeliveryBoys,
    assignDeliveryBoy,
    markShipped,
};

export default shipmentService;
