import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getNews({ page = 0, pageSize = 10, sortField = 'id', sortOrder = 'asc', search = '' }, token) {
  if (!token) { throw new Error('Authentication required'); }
  try { return await apiClient.get('/admin/news', { params: { page, pageSize, sortField, sortOrder, search }, headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function createNews(data, token) {
  if (!token) { throw new Error('Authentication required'); }
  try { return await apiClient.post('/admin/news/create', data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function updateNews(id, data, token) {
  if (!token) { throw new Error('Authentication required'); }
  try { return await apiClient.put(`/admin/news/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function deleteNews(id, token) {
  if (!token) { throw new Error('Authentication required'); }
  try { return await apiClient.delete(`/admin/news/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); }
}

export async function getPublicNews({ page = 0, pageSize = 10, sortField = 'id', sortOrder = 'desc', search = '' }) {
  try { return await apiClient.get('/get-all-news', { params: { page, pageSize, sortField, sortOrder, search } }); } catch (e) { handleAxiosError(e); }
}

export async function getPublicNewsById(id) { try { return await apiClient.get(`/get-new-by-id/${id}`); } catch (e) { handleAxiosError(e); } }
