import { api } from './client';

export const listUsers = (params) => api.get('/users', params);

export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);

export const updateUser = (id, body) => api.patch(`/users/${id}`, body).then((r) => r.data);
