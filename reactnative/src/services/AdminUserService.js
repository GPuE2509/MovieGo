import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) throw new Error(error.response.data.data); throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export const getUsers = async (token, page = 0, size = 10) => {
  try { 
    const response = await apiClient.get('/admin/users', { 
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size }
    }); 
    return response.data;
  }
  catch (error) { handleAxiosError(error); }
};

export const getUserById = async (id, token) => {
  try { 
    const response = await apiClient.get(`/admin/users/${id}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    }); 
    return response.data;
  }
  catch (error) { handleAxiosError(error); }
};

export const updateUserStatus = async (id, data, token) => {
  try { 
    const response = await apiClient.patch(`/admin/users/update/status/${id}`, data, { 
      headers: { Authorization: `Bearer ${token}` } 
    }); 
    return response.data;
  }
  catch (error) { handleAxiosError(error); }
};


