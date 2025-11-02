import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getTheaterById, updateTheater, deleteTheater } from '../services/TheaterService';

export default function AdminTheaterEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-theater-detail', id],
    queryFn: () => getTheaterById(id, token),
    enabled: !!id && !!token,
  });

  const t = data?.data || data || {};
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (t) {
      setName(t?.name || '');
      setAddress(t?.address || '');
    }
  }, [t]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateTheater(id, { name, address }, token);
      Alert.alert('Thành công', 'Đã cập nhật rạp');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  const onDelete = () => {
    Alert.alert('Xác nhận', 'Xóa rạp này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try { await deleteTheater(id, token); Alert.alert('Đã xóa', 'Rạp đã bị xóa'); navigation.goBack(); }
        catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa rạp</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

      <Text style={styles.label}>Tên</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <View style={{ height: 12 }} />
      <Button title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={onSave} disabled={saving || !name} />
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
