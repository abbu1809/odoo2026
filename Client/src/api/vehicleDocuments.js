import { api } from './client';

export const listVehicleDocuments = (vehicleId) =>
  api.get(`/vehicles/${vehicleId}/documents`).then((r) => r.data);

export const uploadVehicleDocument = (vehicleId, { label, file }) => {
  const formData = new FormData();
  formData.append('label', label);
  formData.append('file', file);
  return api.postForm(`/vehicles/${vehicleId}/documents`, formData).then((r) => r.data);
};

export const downloadVehicleDocument = (documentId) =>
  api.getBlob(`/vehicle-documents/${documentId}/download`);

export const deleteVehicleDocument = (documentId) => api.delete(`/vehicle-documents/${documentId}`);
