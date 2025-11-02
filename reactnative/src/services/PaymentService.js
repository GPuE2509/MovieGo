import apiClient from './apiClient';
import { storage } from '../utils/storage';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function fetchPaymentMethods() {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try { const res = await apiClient.get('/payments/methods', { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function processPayment(bookingId, paymentMethodId) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const res = await apiClient.post(`/user/bookings/pay/${bookingId}`, { paymentMethodId }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data?.data?.paymentUrl;
  } catch (e) { handleAxiosError(e); }
}

export async function applyCoupon(bookingId, couponCode) {
  const token = await storage.get('token');
  if (!token) { throw new Error('Authentication required'); }
  try {
    const res = await apiClient.post(`/user/bookings/apply-coupon/${bookingId}`, { couponCode }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data?.data;
  } catch (e) { handleAxiosError(e); }
}
