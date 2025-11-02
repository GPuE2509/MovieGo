import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getMovies() {
  try { const res = await apiClient.get('/now-showing'); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getShowtimesByMovieIdAndTheater(movieId, theaterId, date) {
  try { const res = await apiClient.get(`/showtime/movie/${movieId}/theater/${theaterId}`, { params: { date } }); return res.data?.data?.data || []; } catch (e) { handleAxiosError(e); }
}

export async function getAllShowtimesByMovie(movieId) {
  try { const res = await apiClient.get(`/movie/${movieId}`); return res.data?.data?.data || []; } catch (e) { handleAxiosError(e); }
}
