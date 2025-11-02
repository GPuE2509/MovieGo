import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export const getUsers = async (token) => {
  try { return await apiClient.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
};

export const getUserById = async (id, token) => {
  try { return await apiClient.get(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
};

export const updateUserStatus = async (id, data, token) => {
  try { return await apiClient.patch(`/admin/users/update/status/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
};

export const deleteUser = async (id, token) => {
  try { return await apiClient.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
};

export const addUser = async (data, token) => {
  try { return await apiClient.post('/admin/users', data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
};
