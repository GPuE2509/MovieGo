import { jwtDecode } from 'jwt-decode';
import apiClient from './apiClient';
import { storage } from '../utils/storage';

const handleAxiosError = (error) => {
  console.error('API Error:', error);
  
  if (error?.response?.data) {
    // If response has specific error message
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      throw new Error(errorData);
    }
    if (errorData.message) {
      throw new Error(errorData.message);
    }
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(JSON.stringify(errorData));
  }
  
  if (error?.message) {
    throw new Error(error.message);
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

export const register = async ({ first_name, last_name, phone, email, password, address }) => {
  try {
    console.log('Registering user with data:', { first_name, last_name, phone, email, address });
    
    const payload = {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim(),
      password,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    };

    // Remove null or empty fields
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });
    
    console.log('Final payload:', payload);
    
    const res = await apiClient.post('/auth/register', payload);
    console.log('Registration response:', res.data);
    
    // Chỉ trả về thông báo thành công, không trả về token
    return { 
      success: true, 
      message: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập để tiếp tục.' 
    };
  } catch (error) {
    console.error('Registration failed:', error);
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
