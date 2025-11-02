import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getFestivalDetail, updateFestival, deleteFestival } from '../services/FestivalService';

export default function AdminFestivalEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-festival-detail', id],
    queryFn: () => getFestivalDetail(id),
    enabled: !!id && !!token,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = data?.data || data;
    if (d) {
      setTitle(d?.title || d?.name || '');
      setDescription(d?.description || '');
    }
  }, [data]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateFestival(id, { title, description }, token);
      Alert.alert('Thành công', 'Đã cập nhật liên hoan phim');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  const onDelete = () => {
    Alert.alert('Xác nhận', 'Xóa liên hoan phim này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await deleteFestival(id, token);
          Alert.alert('Đã xóa', 'Đã xóa liên hoan phim');
          navigation.goBack();
        } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa liên hoan phim</Text>
      {!id && <Text>Thiếu id</Text>}
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline />

      <View style={{ height: 12 }} />
      <Button title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={onSave} disabled={saving || !title} />
      <View style={{ height: 8 }} />
      <Button title="Xóa" color="#dc2626" onPress={onDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }
});
