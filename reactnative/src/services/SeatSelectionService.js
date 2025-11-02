import apiClient from './apiClient';

const handleAxiosError = (error) => { if (error?.response?.data?.data) { throw new Error(error.response.data.data); } throw new Error('Lỗi kết nối server hoặc server không phản hồi đúng định dạng.'); };

export async function fetchSeatsByShowtime(showtimeId, token, theaterId) {
  try {
    const params = theaterId ? { theaterId } : {};
    const res = await apiClient.get(`/seat/showtime/${showtimeId}`, { headers: { Authorization: `Bearer ${token}` }, params });
    return res.data;
  } catch (e) { handleAxiosError(e); }
}

export async function createBooking(showtimeId, seatIds, token) {
  try {
    const res = await apiClient.post('/user/bookings', { showtimeId, seatIds }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data?.data?.id;
  } catch (e) { handleAxiosError(e); }
}

const SeatSelectionService = { fetchSeats: fetchSeatsByShowtime, createBooking };
export default SeatSelectionService;
