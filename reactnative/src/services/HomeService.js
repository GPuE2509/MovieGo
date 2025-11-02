 import apiClient from './apiClient';
 import { storage } from '../utils/storage';

 const handleAxiosError = (error) => {
   if (error?.response?.data?.data) {
     throw new Error(error.response.data.data);
   }
   throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.');
 };

 export async function getNowShowingMovies() {
   try {
     const res = await apiClient.get('/now-showing');
     return res.data?.data;
   } catch (error) { handleAxiosError(error); }
 }

 export async function getComingSoonMovies() {
   try { const res = await apiClient.get('/now-coming'); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getFestivals(page = 0, pageSize = 10) {
   try { const res = await apiClient.get('/get-all-festivals', { params: { page, pageSize } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getBanners() {
   try { const res = await apiClient.get('/get-all-banners'); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getPromotions() {
   try { const res = await apiClient.get('/get-all-promotion'); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getPromotionsForCarousel() {
   try { const res = await apiClient.get('/promotions/carousel'); return res.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getNewsForCarousel() {
   try { const res = await apiClient.get('/news/carousel'); return res.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getTopFestivals() {
   try { const res = await apiClient.get('/festivals/top'); return res.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getMovieRecommendations() {
   const token = await storage.get('token');
   if (!token) { throw new Error('Authentication required'); }
   try { const res = await apiClient.get('/recommendations', { headers: { Authorization: `Bearer ${token}` } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getAllStates() {
   try { const res = await apiClient.get('/get-all-states'); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getTheatersByState(state) {
   try { const res = await apiClient.get('/get-theaters-by-state', { params: { state } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getNearestTheater(latitude, longitude) {
   try { const res = await apiClient.get('/get-nearest-theater', { params: { latitude, longitude } }); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }

 export async function getPromotionDetail(id) {
   try { const res = await apiClient.get(`/get-promotion-detail/${id}`); return res.data?.data; } catch (e) { handleAxiosError(e); }
 }
