import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getShowtimesByMovieId(movieId, page = 0, size = 50) {
  try { const res = await apiClient.get(`/movie/${movieId}`, { params: { page, size } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getShowtimesByMovieAndTheater(movieId, theaterId, token, page = 0, size = 10, date, screenId) {
  try {
    const params = { theaterId, page, size, date, screenId };
    const res = await apiClient.get(`/admin/showtimes/movie/${movieId}`, { params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null)), headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (e) { handleAxiosError(e); }
}

export async function getAvailableDatesByMovieIdAndTheater(movieId, theaterId) {
  try { const res = await apiClient.get(`/showtimes/dates/${movieId}`, { params: { theaterId } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function createShowtime(form, token) { try { return await apiClient.post('/admin/showtime/create', form, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function getShowtimeById(id, token) { try { const res = await apiClient.get(`/showtime/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function deleteShowtime(id, token) { try { return await apiClient.delete(`/admin/showtime/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); throw e; } }

export async function getSeatsByShowtimeId(showtimeId, theaterId) { try { const res = await apiClient.get(`/showtimes/${showtimeId}/seats`, { params: { theaterId } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }
