import { api } from './client';

export const listTrips = (params) => api.get('/trips', params);

export const getTrip = (id) => api.get(`/trips/${id}`).then((r) => r.data);

export const createTrip = (body) => api.post('/trips', body).then((r) => r.data);

export const updateTrip = (id, body) => api.patch(`/trips/${id}`, body).then((r) => r.data);

export const dispatchTrip = (id) => api.post(`/trips/${id}/dispatch`).then((r) => r.data);

export const completeTrip = (id, body) => api.post(`/trips/${id}/complete`, body).then((r) => r.data);

export const cancelTrip = (id) => api.post(`/trips/${id}/cancel`).then((r) => r.data);
