import axios from 'axios';

const API_URL = '/api/listings/marketplace';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getMarketplaceListings = async (filters = {}) => {
  const res = await axios.get(API_URL, { ...authHeader(), params: filters });
  return res.data;
};

export const getMarketplaceCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`, authHeader());
  return res.data;
};

export const getMarketplaceListingById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader());
  return res.data;
};