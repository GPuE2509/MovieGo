import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getFestivals({ page = 0, pageSize = 10, sortField = 'id', sortOrder = 'asc', search = '' }, token) {
  try { return await apiClient.get('/admin/festivals', { params: { page, pageSize, sortField, sortOrder, search }, headers: { Authorization: `Bearer ${token}` } }); }
  catch (e) { handleAxiosError(e); }
}

export async function createFestival(data, token) {
  try { return await apiClient.post('/admin/festival/create', data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (e) { handleAxiosError(e); }
}

export async function updateFestival(id, data, token) {
  try { return await apiClient.put(`/admin/festival/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (e) { handleAxiosError(e); }
}

export async function deleteFestival(id, token) {
  try { return await apiClient.delete(`/admin/festival/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (e) { handleAxiosError(e); }
}

export async function updateImageFestival(id, data, token) {
  try { return await apiClient.put(`/admin/user/update-festival-image/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (e) { handleAxiosError(e); }
}

export async function getFestivalDetail(id) {
  try { const res = await apiClient.get(`/get-festival-detail/${id}`); return res.data?.data; }
  catch (e) { handleAxiosError(e); }
}
