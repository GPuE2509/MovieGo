import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getMovieById(movieId, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.get(`/movies/${movieId}`, { headers });
    return res.data?.data;
  } catch (e) { handleAxiosError(e); }
}

export async function getShowtimeDates(movieId) {
  try { const res = await apiClient.get(`/showtimes/dates/${movieId}`); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getShowtimesByMovieAndDate(movieId, date, page = 0, size = 50) {
  try { const res = await apiClient.get(`/showtimes/movie/${movieId}`, { params: { date, page, size } }); return res.data?.data?.data || []; } catch (e) { handleAxiosError(e); }
}
