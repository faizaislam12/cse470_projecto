import axios from 'axios';

const API_URL = '/api/pickups';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const schedulePickup = async (payload) => {
  const res = await axios.post(API_URL, payload, authHeader());
  return res.data;
};

export const reschedulePickup = async (id, payload) => {
  const res = await axios.patch(`${API_URL}/${id}/reschedule`, payload, authHeader());
  return res.data;
};

export const updatePickupStatus = async (id, payload) => {
  const res = await axios.patch(`${API_URL}/${id}/status`, payload, authHeader());
  return res.data;
};

export const getPickupTracking = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader());
  return res.data;
};

export const listPickups = async (status) => {
  const res = await axios.get(API_URL, { ...authHeader(), params: status ? { status } : {} });
  return res.data;
};
