import apiClient from './apiClient';
import { storage } from '../utils/storage';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getProfile(userId) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try { const res = await apiClient.get(`/user/get-profile-user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function updateProfile(userId, profileData) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const formData = new FormData();
    formData.append('firstName', profileData.firstName);
    formData.append('lastName', profileData.lastName);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);
    formData.append('address', profileData.address);
    const res = await apiClient.put(`/user/update-profile-user/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
    return res.data?.data;
  } catch (e) { handleAxiosError(e); }
}

export async function updateAvatar(userId, avatarFile) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const res = await apiClient.put(`/user/update-avatar-user/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
    return res.data?.data;
  } catch (e) { handleAxiosError(e); }
}

export async function changePassword(userId, { oldPassword, newPassword, confirmNewPassword }) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const res = await apiClient.put(`/user/change-password/${userId}`, { oldPassword, newPassword, confirmNewPassword }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data?.data;
  } catch (e) { handleAxiosError(e); }
}
