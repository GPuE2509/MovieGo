import apiClient from './apiClient';

const handleAxiosError = (error) => {
  if (error?.response?.data?.data) throw new Error(error.response.data.data);
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export async function getAllSeats({ keyword = '', page = 0, size = 100, sortBy = 'seatNumber', direction = 'asc', screenId }, token) {
  try {
    const params = { keyword, page, size, sortBy, direction };
    if (screenId) params.screenId = screenId;
    const res = await apiClient.get('/admin/seats', { params, headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function getAllDeletedSeats({ keyword = '', page = 0, size = 100, sortBy = 'seatNumber', direction = 'asc', screenId }, token) {
  try {
    const params = { keyword, page, size, sortBy, direction };
    if (screenId) params.screenId = screenId;
    const res = await apiClient.get('/admin/seats/deleted', { params, headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function createSeat(data, token) {
  try { return await apiClient.post('/admin/seat/create', data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); throw error; }
}

export async function updateSeat(id, data, token) {
  try { return await apiClient.put(`/admin/seat/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function deleteSeat(id, token) {
  try { return await apiClient.delete(`/admin/seat/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function restoreSeat(id, token) {
  try { return await apiClient.put(`/admin/seat/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function getSeatById(id, token) {
  try { return await apiClient.get(`/admin/seat/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function getAllTheaters(token) {
  try { return await apiClient.get('/admin/theaters', { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function getScreenByTheaterId(theaterId, token) {
  try { return await apiClient.get(`/admin/screen/get-screen-by-theater-id/${theaterId}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function getSeatsByShowtime(showtimeId, token) {
  try { return await apiClient.get(`/seat/showtime/${showtimeId}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function getAdminSeatsByShowtime(showtimeId, token) {
  try { return await apiClient.get(`/admin/seat/showtime/${showtimeId}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export function generateMockSeats(totalSeats = 37) {
  return Array.from({ length: totalSeats }, (_, i) => ({ id: i + 1, type: i % 10 === 0 ? 'VIP' : (i % 7 === 0 ? 'COUPLE' : 'NORMAL') }));
}
