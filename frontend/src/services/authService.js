import axios from 'axios';

const API_URL = '/api/auth';

export const register = async (payload) => {
  const res = await axios.post(`${API_URL}/register`, payload);
  return res.data;
};

export const login = async (payload) => {
  const res = await axios.post(`${API_URL}/login`, payload);
  return res.data;
};
