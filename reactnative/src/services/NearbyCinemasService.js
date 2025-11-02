import axios from 'axios';
import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;
const cache = new Map();

export async function geocodeAddress(address) {
  if (cache.has(address)) return cache.get(address);
  try {
    if (!GEOCODING_API_KEY) { throw new Error('GEOCODING_API_KEY chưa được cấu hình'); }
    const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: { text: address, apiKey: GEOCODING_API_KEY, limit: 1 },
    });
    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      const [lon, lat] = feature.geometry.coordinates;
      const result = { lat, lon, address: feature.properties.formatted };
      cache.set(address, result);
      return result;
    }
    throw new Error('Không tìm thấy tọa độ cho địa chỉ này');
  } catch (error) {
    throw new Error('Không thể tìm tọa độ cho địa chỉ này. Vui lòng kiểm tra lại địa chỉ.');
  }
}

export async function getNearbyCinemas(lat, lon, radius = 5, date = null, limit = 10) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const res = await apiClient.get('/theaters-near', { params: { lat, lon, radius, date: targetDate, limit } });
    return res.data?.data || [];
  } catch (e) { handleAxiosError(e); }
}
