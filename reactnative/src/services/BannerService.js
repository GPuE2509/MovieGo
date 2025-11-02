import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllBanners() { try { return await apiClient.get('/get-all-banners'); } catch (error) { handleAxiosError(error); } }

export async function getBannerById(id) { try { return await apiClient.get(`/banners/${id}`); } catch (error) { handleAxiosError(error); } }

export async function createBanner(data, token) {
  try {
    return await apiClient.post('/admin/banner/create', data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
  } catch (error) { handleAxiosError(error); }
}

export async function deleteBanner(id, token) { try { return await apiClient.delete(`/admin/banner/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (error) { handleAxiosError(error); } }
