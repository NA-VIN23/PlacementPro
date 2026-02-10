import { api } from './api';

export const placementInsightsService = {
    getOverview: async () => {
        const response = await api.get('/placement-insights/overview');
        return response.data;
    },
    getCompanies: async () => {
        const response = await api.get('/placement-insights/companies');
        return response.data;
    },
    getCompanyDetail: async (id: string) => {
        const response = await api.get(`/placement-insights/companies/${id}`);
        return response.data;
    },
    getUpcomingDrives: async () => {
        const response = await api.get('/placement-insights/upcoming');
        return response.data;
    }
};
