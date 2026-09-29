import api from './api';

const getFarmerRevenue = async () => {
    const response = await api.get('/farmers/revenue');
    return response.data;
};

const farmerService = {
    getFarmerRevenue,
};

export default farmerService;
