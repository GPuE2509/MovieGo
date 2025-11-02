import apiClient from './apiClient';

const handleAxiosError = (error) => {
  if (error?.response?.data?.data) throw new Error(error.response.data.data);
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export async function getPromotions({ page = 0, pageSize = 10, sortField = 'id', sortOrder = 'asc', search = '' }, token) {
  try {
    const res = await apiClient.get('/admin/promotions', {
      params: { page, pageSize, sortField, sortOrder, search },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function createPromotion(data, token) {
  try {
    const res = await apiClient.post('/admin/promotion/create', data, { headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function updatePromotion(id, data, token) {
  try {
    const res = await apiClient.put(`/admin/promotion/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function deletePromotion(id, token) {
  try {
    const res = await apiClient.delete(`/admin/promotion/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function getPromotionById(id, token) {
  try {
    const res = await apiClient.get(`/admin/promotion/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}
