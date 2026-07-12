import { api } from './client';

export const listVehicles = (params) => api.get('/vehicles', params);

export const getVehicle = (id) => api.get(`/vehicles/${id}`).then((r) => r.data);

export const createVehicle = (body) => api.post('/vehicles', body).then((r) => r.data);

export const updateVehicle = (id, body) => api.patch(`/vehicles/${id}`, body).then((r) => r.data);

export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

export const downloadVehiclesCsv = (params) => api.getBlob('/vehicles', { ...params, format: 'csv' });
