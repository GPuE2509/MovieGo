import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllScreens() { try { const res = await apiClient.get('/screen'); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function getScreenById(id) { try { const res = await apiClient.get(`/screens/${id}`); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function createScreen(screenData, token) { try { const res = await apiClient.post('/screens', screenData, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function updateScreen(id, screenData, token) { try { const res = await apiClient.put(`/screens/${id}`, screenData, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function deleteScreen(id, token) { try { const res = await apiClient.delete(`/screens/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function getAllAdminScreens(token) {
  try {
    const res = await apiClient.get('/admin/screen', { headers: { Authorization: `Bearer ${token}` } });
    const resData = res.data?.data || {};
    return { list: Array.isArray(resData.data) ? resData.data : [], total: resData.total || 0 };
  } catch (e) { handleAxiosError(e); }
}

export async function getAdminScreenById(id, token) { try { const res = await apiClient.get(`/admin/screen/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function createAdminScreen(screenData, token) { try { const res = await apiClient.post('/admin/screen', screenData, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function updateAdminScreen(id, screenData, token) { try { const res = await apiClient.put(`/admin/screen/${id}`, screenData, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function deleteAdminScreen(id, token) { try { const res = await apiClient.delete(`/admin/screen/${id}`, { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); } }
