import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUserStats, fetchMovieStats, fetchRevenueStats, fetchTicketStats, fetchNewsEventStats } from '../services/StatisticsService';

export default function StatisticsScreen() {
  const { token } = useContext(AuthContext);
  const users = useQuery({ queryKey: ['stats-users'], queryFn: () => fetchUserStats(token), enabled: !!token });
  const movies = useQuery({ queryKey: ['stats-movies'], queryFn: () => fetchMovieStats(token), enabled: !!token });
  const revenue = useQuery({ queryKey: ['stats-revenue'], queryFn: () => fetchRevenueStats(token), enabled: !!token });
  const tickets = useQuery({ queryKey: ['stats-tickets'], queryFn: () => fetchTicketStats(token), enabled: !!token });
  const news = useQuery({ queryKey: ['stats-news'], queryFn: () => fetchNewsEventStats(token), enabled: !!token });

  // Helper: try mapping to array of {label, value}
  const toSeries = (raw) => {
    const data = raw?.data ?? raw;
    if (Array.isArray(data)) return data.map((v, i) => ({ label: String(v?.label ?? i+1), value: Number(v?.value ?? v ?? 0) }));
    if (data && typeof data === 'object') return Object.entries(data).map(([k, v]) => ({ label: String(k), value: Number(v ?? 0) }));
    if (typeof data === 'number') return [{ label: 'value', value: data }];
    return [];
  };

  const Bar = ({ label, value, max }) => (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${max ? (value / max * 100) : 0}%` }]} />
      </View>
      <Text style={styles.barValue}>{String(value)}</Text>
    </View>
  );

  const renderChart = (title, query) => {
    if (query.isLoading) return <Text>{title}: Đang tải...</Text>;
    if (query.error) return <Text style={{ color: 'red' }}>{title}: Lỗi</Text>;
    const series = toSeries(query.data);
    const max = series.reduce((m, s) => Math.max(m, s.value), 0);
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.section}>{title}</Text>
        {series.length === 0 ? (
          <Text>Không có dữ liệu</Text>
        ) : (
          series.slice(0, 10).map((s, idx) => <Bar key={`${title}-${idx}`} label={s.label} value={s.value} max={max} />)
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thống kê</Text>
      {renderChart('Người dùng', users)}
      {renderChart('Phim', movies)}
      {renderChart('Doanh thu', revenue)}
      {renderChart('Vé', tickets)}
      {renderChart('Tin tức/Sự kiện', news)}
      <Text style={styles.note}>Ghi chú: có thể chuyển sang thư viện biểu đồ RN khi cần.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  barLabel: { width: 90 },
  barTrack: { flex: 1, height: 10, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#60a5fa' },
  barValue: { width: 48, textAlign: 'right' },
  note: { marginTop: 12, color: '#666' }
});
