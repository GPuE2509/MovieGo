import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllScreens() { try { const res = await apiClient.get('/screens'); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function getScreenById(id) { try { const res = await apiClient.get(`/screens/${id}`); return res.data?.data; } catch (e) { handleAxiosError(e); } }

export async function createScreen(screenData, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.post('/screen', screenData, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function updateScreen(id, screenData, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.put(`/screens/${id}`, screenData, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function deleteScreen(id, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.delete(`/screens/${id}`, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function getAllAdminScreens(params = {}, token) {
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
    
    const url = `/admin/screens${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const res = await apiClient.get(url, { 
      headers: { 
        Authorization: `Bearer ${tokenString}` 
      } 
    });
    
    return res.data;
  } catch (e) { 
    console.error('getAllAdminScreens error:', e);
    handleAxiosError(e); 
  }
}

export async function getAdminScreenById(id, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.get(`/admin/screen/${id}`, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function createAdminScreen(screenData, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.post('/admin/screen', screenData, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function updateAdminScreen(id, screenData, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.put(`/admin/screen/${id}`, screenData, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}

export async function deleteAdminScreen(id, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    const res = await apiClient.delete(`/admin/screen/${id}`, { headers: { Authorization: `Bearer ${tokenString}` } }); 
    return res.data?.data; 
  } catch (e) { handleAxiosError(e); } 
}
