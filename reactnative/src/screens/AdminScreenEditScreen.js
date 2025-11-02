import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getAdminScreenById, updateAdminScreen, deleteAdminScreen } from '../services/Screens';

export default function AdminScreenEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-screen-detail', id],
    queryFn: () => getAdminScreenById(id, token),
    enabled: !!id && !!token,
  });

  const d = data?.data || data || {};
  const [name, setName] = useState('');
  const [theaterId, setTheaterId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (d) {
      setName(d?.name || '');
      setTheaterId(String(d?.theaterId || ''));
    }
  }, [d]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateAdminScreen(id, { name, theaterId: theaterId ? Number(theaterId) : null }, token);
      Alert.alert('Thành công', 'Đã cập nhật phòng chiếu');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  const onDelete = () => {
    Alert.alert('Xác nhận', 'Xóa phòng chiếu này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try { await deleteAdminScreen(id, token); Alert.alert('Đã xóa', 'Đã xóa phòng chiếu'); navigation.goBack(); }
        catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa phòng chiếu</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

      <Text style={styles.label}>Tên</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Theater ID</Text>
      <TextInput style={styles.input} value={theaterId} onChangeText={setTheaterId} keyboardType="numeric" />

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
