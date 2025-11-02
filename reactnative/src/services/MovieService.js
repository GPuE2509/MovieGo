import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getMovies(params = {}, token) {
  try { const res = await apiClient.get('/admin/movies', { params: { ...params }, headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
}

export async function getNowShowingMovies() { try { const res = await apiClient.get('/now-showing'); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function getNowComingMovies() { try { const res = await apiClient.get('/now-coming'); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function getMovieById(id, token) { try { const res = await apiClient.get(`/admin/movie/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function createMovie(formData, token) { try { const res = await apiClient.post('/admin/movie/create', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function updateMovie(id, data, token) { try { const res = await apiClient.put(`/admin/movie/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function updateMovieImage(id, imageFile, token) { try { const formData = new FormData(); formData.append('image', imageFile); const res = await apiClient.patch(`/admin/movie/update/image/${id}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function deleteMovie(id, token) { try { const res = await apiClient.delete(`/admin/movie/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }
