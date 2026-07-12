import { api } from './client';

export const listDrivers = (params) => api.get('/drivers', params);

export const getDriver = (id) => api.get(`/drivers/${id}`).then((r) => r.data);

export const createDriver = (body) => api.post('/drivers', body).then((r) => r.data);

export const updateDriver = (id, body) => api.patch(`/drivers/${id}`, body).then((r) => r.data);

export const deleteDriver = (id) => api.delete(`/drivers/${id}`);
