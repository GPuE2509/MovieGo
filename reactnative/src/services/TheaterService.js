import axios from 'axios';
import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function getAllTheaters({ search = '', page = 0, size = 100 } = {}, token) {
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    return await apiClient.get('/admin/theaters', { 
      params: { search, page, size }, 
      headers: tokenString ? { Authorization: `Bearer ${tokenString}` } : {} 
    }); 
  } catch (e) { handleAxiosError(e); }
}

export async function getTheaterById(id, token) {
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    return await apiClient.get(`/theater/${id}`, { 
      headers: tokenString ? { Authorization: `Bearer ${tokenString}` } : {} 
    }); 
  } catch (e) { handleAxiosError(e); }
}

export async function createTheater(data, token) {
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    return await axios.post(`${apiClient.defaults.baseURL}/admin/theater/create`, data, { 
      headers: { Authorization: `Bearer ${tokenString}` } 
    }); 
  } catch (e) { handleAxiosError(e); }
}

export async function updateTheater(id, data, token) {
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    return await axios.put(`${apiClient.defaults.baseURL}/admin/theater/update/${id}`, data, { 
      headers: { Authorization: `Bearer ${tokenString}` } 
    }); 
  } catch (e) { handleAxiosError(e); }
}

export async function deleteTheater(id, token) { 
  try { 
    const tokenString = typeof token === 'string' ? token : token?.token || token?.accessToken || '';
    return await apiClient.delete(`/admin/theater/delete/${id}`, { 
      headers: { Authorization: `Bearer ${tokenString}` } 
    }); 
  } catch (e) { handleAxiosError(e); } 
}
