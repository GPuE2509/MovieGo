import { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getMovieById as getAdminMovieById, updateMovie, deleteMovie } from '../services/MovieService';

export default function AdminMovieEditScreen({ route = {}, navigation = {} }) {
  const { token } = useContext(AuthContext);
  const { id } = route?.params ?? {};
  
  // Debug logs
  console.log('AdminMovieEditScreen - Route object:', route);
  console.log('AdminMovieEditScreen - Route params:', route?.params);
  console.log('AdminMovieEditScreen - Movie ID:', id);
  console.log('AdminMovieEditScreen - Token:', token);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-movie-detail', id],
    queryFn: () => getAdminMovieById(id, token),
    enabled: !!id && !!token,
  });
  
  // Debug query state
  console.log('AdminMovieEditScreen - Query data:', data);
  console.log('AdminMovieEditScreen - Query loading:', isLoading);
  console.log('AdminMovieEditScreen - Query error:', error);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setTitle(data?.title || data?.name || '');
      setDescription(data?.description || '');
      setDuration(String(data?.duration || ''));
    }
  }, [data]);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = { title, description, duration: Number(duration) || null };
      await updateMovie(id, payload, token);
      Alert.alert('Thành công', 'Đã cập nhật phim');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phim này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await deleteMovie(id, token);
          Alert.alert('Đã xóa', 'Phim đã bị xóa');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Lỗi', String(e?.message || e));
        }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa phim</Text>
      {!id && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Thiếu ID phim</Text>
          <Text style={styles.errorDetail}>Route: {route ? 'có' : 'undefined'}</Text>
          <Text style={styles.errorDetail}>Route params: {JSON.stringify(route?.params || null)}</Text>
        </View>
      )}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Đang tải thông tin phim...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Lỗi: {String(error?.message || error)}</Text>
          <Text style={styles.errorDetail}>Movie ID: {id}</Text>
        </View>
      )}
      
      {/* Show form only when we have data or not loading */}
      {!isLoading && !error && id && (
        <View>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Mô tả</Text>
          <TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline />

          <Text style={styles.label}>Thời lượng (phút)</Text>
          <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />

          <View style={{ height: 12 }} />
          <Button title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={onSave} disabled={saving || !title} />
          <View style={{ height: 8 }} />
          <Button title="Xóa phim" color="#dc2626" onPress={onDelete} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  errorContainer: {
    backgroundColor: '#FDE8E8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginVertical: 8
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4
  },
  errorDetail: {
    color: '#7F1D1D',
    fontSize: 12,
    fontFamily: 'monospace'
  },
  loadingContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    marginVertical: 8
  },
  loadingText: {
    color: '#0284C7',
    fontWeight: '600',
    fontSize: 16
  }
});
