import { api } from './client';

export const listFuelLogs = (params) => api.get('/fuel-logs', params);

export const getFuelLog = (id) => api.get(`/fuel-logs/${id}`).then((r) => r.data);

export const createFuelLog = (body) => api.post('/fuel-logs', body).then((r) => r.data);

export const updateFuelLog = (id, body) => api.patch(`/fuel-logs/${id}`, body).then((r) => r.data);

export const deleteFuelLog = (id) => api.delete(`/fuel-logs/${id}`);
