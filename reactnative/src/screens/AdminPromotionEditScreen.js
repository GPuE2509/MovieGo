import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getPromotionById, updatePromotion, deletePromotion } from '../services/AdminPromotionService';

export default function AdminPromotionEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-promotion-detail', id],
    queryFn: () => getPromotionById(id, token),
    enabled: !!id && !!token,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = data?.data || data;
    if (d) {
      setTitle(d?.title || '');
      setDescription(d?.description || '');
    }
  }, [data]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updatePromotion(id, { title, description }, token);
      Alert.alert('Thành công', 'Đã cập nhật khuyến mãi');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    } finally { setSaving(false); }
  };

  const onDelete = () => {
    Alert.alert('Xác nhận', 'Xóa khuyến mãi này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await deletePromotion(id, token);
          Alert.alert('Đã xóa', 'Khuyến mãi đã bị xóa');
          navigation.goBack();
        } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa khuyến mãi</Text>
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
