import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getMyBookings(token) {
  try { const res = await apiClient.get('/user/bookings/my-bookings', { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getBookingDetail(token, bookingId) {
  try { const res = await apiClient.get(`/user/bookings/my-bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getAllHistoryAward(token) {
  try { const res = await apiClient.get('/user/bookings/getAllHistoryAward', { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}
