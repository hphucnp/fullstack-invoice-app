import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Invoice API calls
export const getInvoices = (params = {}) => {
  return api.get('/invoices/', { params });
};

export const getInvoice = (id) => {
  return api.get(`/invoices/${id}/`);
};

export const createInvoice = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return api.post('/invoices/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateInvoice = (id, data) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return api.put(`/invoices/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteInvoice = (id) => {
  return api.delete(`/invoices/${id}/`);
};

export default api;
