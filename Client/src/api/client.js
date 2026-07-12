const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path, params) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function request(path, { method = 'GET', body, params, responseType } = {}) {
  const headers = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  if (responseType === 'blob') {
    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        message = errJson.message || message;
      } catch {
        /* not JSON, keep default message */
      }
      throw new ApiError(message, res.status);
    }
    return res.blob();
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || `Request failed with status ${res.status}`, res.status, json.details);
  }

  return json;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  getBlob: (path, params) => request(path, { method: 'GET', params, responseType: 'blob' }),
};
