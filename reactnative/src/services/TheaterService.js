import axios from 'axios';
import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllTheaters({ keyword = '', page = 0, size = 100, sortBy = 'name', direction = 'asc' } = {}, token) {
  try { return await apiClient.get('/theaters', { params: { keyword, page, size, sortBy, direction }, headers: token ? { Authorization: `Bearer ${token}` } : {} }); } catch (e) { handleAxiosError(e); }
}

export async function getTheaterById(id, token) {
  try { return await apiClient.get(`/theater/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); } catch (e) { handleAxiosError(e); }
}

export async function createTheater(data, token) {
  try { return await axios.post(`${apiClient.defaults.baseURL}/admin/theater/create`, data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function updateTheater(id, data, token) {
  try { return await axios.put(`${apiClient.defaults.baseURL}/admin/theater/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function deleteTheater(id, token) { try { return await apiClient.delete(`/admin/theater/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }
