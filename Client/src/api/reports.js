import { api } from './client';

export const getReportsOverview = (params) => api.get('/reports/overview', params).then((r) => r.data);

export const downloadReportsCsv = (params) => api.getBlob('/reports/overview', { ...params, format: 'csv' });

export const downloadReportsPdf = (params) => api.getBlob('/reports/overview', { ...params, format: 'pdf' });
