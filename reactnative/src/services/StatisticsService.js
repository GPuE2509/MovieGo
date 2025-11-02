import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function fetchUserStats(token) { try { return await apiClient.get('/admin/statistics/users', { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function fetchMovieStats(token) { try { return await apiClient.get('/admin/statistics/movies', { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function fetchRevenueStats(token, startDate, endDate) { try { return await apiClient.get('/admin/statistics/revenue', { params: { startDate, endDate }, headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function fetchTicketStats(token, startDate, endDate) { try { return await apiClient.get('/admin/statistics/tickets', { params: { startDate, endDate }, headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function fetchNewsEventStats(token) { try { return await apiClient.get('/admin/statistics/news-events', { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }

export async function fetchSupplierRevenue(token, startDate, endDate) { try { return await apiClient.get('/admin/statistics/suppliers', { params: { startDate, endDate }, headers: { Authorization: `Bearer ${token}` } }); } catch (e) { handleAxiosError(e); } }
