import { api } from './client';

export const listExpenses = (params) => api.get('/expenses', params);

export const getExpense = (id) => api.get(`/expenses/${id}`).then((r) => r.data);

export const createExpense = (body) => api.post('/expenses', body).then((r) => r.data);

export const updateExpense = (id, body) => api.patch(`/expenses/${id}`, body).then((r) => r.data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const downloadExpensesCsv = (params) => api.getBlob('/expenses', { ...params, format: 'csv' });
