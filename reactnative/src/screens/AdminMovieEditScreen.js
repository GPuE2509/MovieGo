import { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getMovieById as getAdminMovieById, updateMovie, deleteMovie } from '../services/MovieService';

export default function AdminMovieEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-movie-detail', id],
    queryFn: () => getAdminMovieById(id, token),
    enabled: !!id && !!token,
  });

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
      {!id && <Text>Thiếu id phim</Text>}
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }
});
