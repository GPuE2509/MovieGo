import apiClient from './apiClient';

const handleAxiosError = (error) => {
  if (error?.response?.data?.data) throw new Error(error.response.data.data);
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
};

export async function getAllPaymentMethods(params = {}, token) {
  try {
    // Đảm bảo token là string, không phải object
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    
    // Debug log
    console.log('Token type:', typeof token);
    console.log('Token value:', token);
    console.log('Processed token:', tokenString);
    
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    
    const url = `/admin/get-all-payment-method${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const res = await apiClient.get(url, {
      headers: { Authorization: `Bearer ${tokenString}` },
    });
    return res;
  } catch (error) { 
    console.error('getAllPaymentMethods error:', error);
    handleAxiosError(error); 
  }
}

export async function createPaymentMethod(data, token) {
  try {
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.post('/admin/add-payment-method', data, {
      headers: { Authorization: `Bearer ${tokenString}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function getPaymentMethodById(id, token) {
  try {
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.get(`/admin/payment-method/${id}`, {
      headers: { Authorization: `Bearer ${tokenString}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function updatePaymentMethod(id, data, token) {
  try {
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.put(`/admin/update-payment-method/${id}`, data, {
      headers: { Authorization: `Bearer ${tokenString}` },
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}

export async function deletePaymentMethod(data, token) {
  try {
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.delete('/admin/delete-payment-method', {
      headers: { Authorization: `Bearer ${tokenString}` },
      data,
    });
    return res;
  } catch (error) { handleAxiosError(error); }
}
