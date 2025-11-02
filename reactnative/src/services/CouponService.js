import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAvailableCouponsForUser(userId, token) {
  try { const res = await apiClient.get(`/user/available-coupons/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); }
}

export async function getMyCoupons(userId, token) {
  try { const res = await apiClient.get(`/user/my-coupons/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); }
}

export async function exchangeCoupon(couponId, userId, token) {
  try { const res = await apiClient.post(`/user/exchange/${couponId}/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); }
}

export async function canExchangeCoupon(couponId, userId, token) {
  try { const res = await apiClient.get(`/user/can-exchange/${couponId}/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); }
}

export async function getAllCoupons({ page = 0, pageSize = 10, sortField = 'name', sortOrder = 'asc', search = '' }, token) {
  try { const res = await apiClient.get('/admin/coupons', { params: { page, pageSize, sortField, sortOrder, search }, headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); }
}

export async function createCoupon(formCoupon, token) { try { const res = await apiClient.post('/admin/coupon/create', formCoupon, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); } }

export async function updateCoupon(id, formCoupon, token) { try { const res = await apiClient.put(`/admin/coupon/update/${id}`, formCoupon, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); } }

export async function deleteCoupon(id, token) { try { const res = await apiClient.delete(`/admin/coupon/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data; } catch (e) { handleAxiosError(e); } }
