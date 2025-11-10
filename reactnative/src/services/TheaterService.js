import axios from 'axios';
import apiClient from './apiClient';

const handleAxiosError = (error) => { 
  console.error('API Error details:', {
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    message: error?.message
  });
  
  if (error?.response?.data?.message) { 
    throw new Error(error.response.data.message); 
  }
  if (error?.response?.data?.data) { 
    throw new Error(error.response.data.data); 
  } 
  if (error?.response?.status === 404) {
    throw new Error('Không tìm thấy rạp hoặc endpoint không tồn tại');
  }
  if (error?.response?.status === 401) {
    throw new Error('Không có quyền truy cập - vui lòng đăng nhập lại');
  }
  if (error?.response?.status === 403) {
    throw new Error('Không có quyền thực hiện thao tác này');
  }
  throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); 
};

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
    const deleteUrl = `/admin/theater/delete/${id}`;
    
    console.log('=== DELETE THEATER API CALL ===');
    console.log('Theater ID:', id);
    console.log('Token present:', !!tokenString);
    console.log('Delete URL:', `${apiClient.defaults.baseURL}${deleteUrl}`);
    console.log('Full headers:', { Authorization: `Bearer ${tokenString.substring(0, 20)}...` });
    
    const response = await apiClient.delete(deleteUrl, { 
      headers: { Authorization: `Bearer ${tokenString}` } 
    });
    
    console.log('Delete response status:', response.status);
    console.log('Delete response data:', response.data);
    console.log('===========================');
    return response.data;
  } catch (e) { 
    console.error('=== DELETE API ERROR ===');
    console.error('Error status:', e?.response?.status);
    console.error('Error data:', e?.response?.data);
    console.error('Error message:', e?.message);
    console.error('Network error:', e?.request ? 'Network issue' : 'Not network');
    console.error('API Base URL:', apiClient.defaults.baseURL);
    console.error('========================');
    handleAxiosError(e); 
  } 
}
