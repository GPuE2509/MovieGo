import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getShowtimeDates, getShowtimesByMovieAndDate } from '../services/MovieDetailService';

export default function ShowtimesScreen({ route, navigation }) {
  const { movieId } = route.params ?? {};
  const [selectedDate, setSelectedDate] = useState(null);

  const datesQ = useQuery({
    queryKey: ['showtime-dates', movieId],
    queryFn: () => getShowtimeDates(movieId),
    enabled: !!movieId,
  });

  const showtimesQ = useQuery({
    queryKey: ['showtimes-by-movie-date', movieId, selectedDate],
    queryFn: () => getShowtimesByMovieAndDate(movieId, selectedDate),
    enabled: !!movieId && !!selectedDate,
  });

  useEffect(() => {
    if (!selectedDate && Array.isArray(datesQ.data) && datesQ.data.length > 0) {
      setSelectedDate(datesQ.data[0]);
    }
  }, [datesQ.data, selectedDate]);

  const dates = useMemo(() => (Array.isArray(datesQ.data) ? datesQ.data : []), [datesQ.data]);
  const showtimes = useMemo(() => (Array.isArray(showtimesQ.data) ? showtimesQ.data : []), [showtimesQ.data]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn suất chiếu</Text>
      {!movieId && <Text>Không có movieId</Text>}

      <Text style={styles.section}>Ngày</Text>
      <FlatList
        data={dates}
        horizontal
        keyExtractor={(item, idx) => String(item ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chip, selectedDate === item && styles.chipSelected]} onPress={() => setSelectedDate(item)}>
            <Text style={styles.chipText}>{String(item)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 8 }}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.section}>Suất chiếu</Text>
      {showtimesQ.isLoading && <Text>Đang tải...</Text>}
      {showtimesQ.error && <Text style={{ color: 'red' }}>Lỗi: {String(showtimesQ.error?.message || showtimesQ.error)}</Text>}
      <FlatList
        data={showtimes}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('SeatSelection', { showtimeId: item?.id })}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item?.theaterName || `Showtime #${item?.id}`}</Text>
            {item?.startTime && <Text style={styles.itemSub}>{String(item.startTime)}</Text>}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  section: { marginTop: 10, fontSize: 16, fontWeight: '600' },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 16 },
  chipSelected: { backgroundColor: '#efefef' },
  chipText: { fontWeight: '600' },
  item: { padding: 12, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8 },
  itemTitle: { fontWeight: '600' },
  itemSub: { color: '#666', marginTop: 2 },
});
