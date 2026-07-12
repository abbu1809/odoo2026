import { api } from './client';

export const getDashboardKpis = (params) => api.get('/dashboard/kpis', params).then((r) => r.data);
