import { jwtDecode } from 'jwt-decode';
import apiClient from './apiClient';
import { storage } from '../utils/storage';

const handleAxiosError = (error) => {
  if (error?.response?.data) {
    throw new Error(error.response.data);
  }
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export const login = async ({ email, password }) => {
  const key = 'failedAttempts_' + email;
  let attempts = parseInt((await storage.get(key)) || '0', 10);
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    await storage.set(key, '0');
    return res.data?.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 400 || status === 401) {
      attempts += 1;
      await storage.set(key, String(attempts));
      if (attempts > 5) {
        try { await apiClient.post('/auth/ban', { email }); } catch {}
        await storage.set(key, '0');
      }
    }
    handleAxiosError(error);
  }
};

export const register = async ({ firstName, lastName, username, phone, email, password, address }) => {
  try {
    const res = await apiClient.post('/auth/register', { firstName, lastName, username, phone, email, password, address });
    return res.data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const logout = async (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) { throw new Error('Token đã hết hạn, vui lòng đăng nhập lại.'); }
    const res = await apiClient.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    await storage.remove('token');
    return res.data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const forgotPassword = async ({ email }) => {
  try {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data?.data;
  } catch (error) { handleAxiosError(error); }
};

export const verifyOTP = async ({ otp, token }) => {
  try {
    const res = await apiClient.post('/auth/verify-otp', { otp }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch {
    throw new Error('OTP không đúng hoặc đã hết hạn!');
  }
};

export const resetPassword = async ({ newPassword, token }) => {
  try {
    const res = await apiClient.post('/auth/reset-password', { newPassword }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch {
    throw new Error('Đổi mật khẩu thất bại!');
  }
};

export const clearRecommendationCache = async () => {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const res = await apiClient.post('/recommendations/clear', {}, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data?.code === 200) { return res.data.data; }
    throw new Error(res.data?.data || 'Không xóa được cache');
  } catch (error) { handleAxiosError(error); }
};
