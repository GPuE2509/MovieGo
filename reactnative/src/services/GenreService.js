import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllGenres(token) { try { return await apiClient.get('/admin/genres', { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function getGenreById(id, token) { try { return await apiClient.get(`/admin/genre/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function createGenre(data, token) { try { return await apiClient.post('/admin/genre/create', data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function updateGenre(id, data, token) { try { return await apiClient.put(`/admin/genre/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function deleteGenre(id, token) { try { return await apiClient.delete(`/admin/genre/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }
