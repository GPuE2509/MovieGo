import apiClient from './apiClient';

const handleAxiosError = (error) => {
  if (error?.response?.data?.data) throw new Error(error.response.data.data);
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export async function getAllBookings(params = {}, token) {
  try {
    const res = await apiClient.get('/admin/bookings', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function getBookingById(id, token) {
  try {
    const res = await apiClient.get(`/admin/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function updateBookingStatus(id, status, token) {
  try {
    const res = await apiClient.put(`/admin/bookings/status/${id}` , null, {
      params: { status },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}
