import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllTicketPrices(params = {}, token) {
  try {
    const res = await apiClient.get('/admin/ticket-prices', { params, headers: { Authorization: `Bearer ${token}` } });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function getTicketPriceById(id, token) {
  try { return await apiClient.get(`/admin/ticket-prices/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function createTicketPrice(data, token) {
  try { return await apiClient.post('/admin/ticket-prices/create', data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function updateTicketPrice(id, data, token) {
  try { return await apiClient.put(`/admin/ticket-prices/update/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}

export async function deleteTicketPrice(id, token) {
  try { return await apiClient.delete(`/admin/ticket-prices/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { handleAxiosError(error); }
}
