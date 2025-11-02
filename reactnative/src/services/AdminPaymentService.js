import apiClient from './apiClient';

const handleAxiosError = (error) => {
  if (error?.response?.data?.data) throw new Error(error.response.data.data);
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export async function getAllPaymentMethods(token) {
  try {
    const res = await apiClient.get('/admin/get-all-payment-method', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function createPaymentMethod(data, token) {
  try {
    const res = await apiClient.post('/admin/add-payment-method', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function deletePaymentMethod(data, token) {
  try {
    const res = await apiClient.delete('/admin/delete-payment-method', {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}
