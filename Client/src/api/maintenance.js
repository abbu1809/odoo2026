import { api } from './client';

export const listMaintenance = (params) => api.get('/maintenance', params);

export const getMaintenance = (id) => api.get(`/maintenance/${id}`).then((r) => r.data);

export const createMaintenance = (body) => api.post('/maintenance', body).then((r) => r.data);

export const updateMaintenance = (id, body) => api.patch(`/maintenance/${id}`, body).then((r) => r.data);

export const closeMaintenance = (id) => api.post(`/maintenance/${id}/close`).then((r) => r.data);
