import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getAllPaymentMethods, createPaymentMethod, deletePaymentMethod } from '../services/AdminPaymentService';

export default function AdminPaymentEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { id } = route.params ?? {};

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => getAllPaymentMethods(token),
    enabled: !!token,
  });

  const methods = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const current = methods.find((m) => String(m?.id) === String(id));

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (current) {
      setName(current?.name || '');
      setDescription(current?.description || '');
    }
  }, [current]);

  const onSave = async () => {
    try {
      setSaving(true);
      // API không có endpoint update riêng, dùng create như upsert nếu backend hỗ trợ; nếu không, bỏ qua.
      await createPaymentMethod({ id, name, description }, token);
      Alert.alert('Thành công', 'Đã lưu phương thức');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  const onDelete = () => {
    Alert.alert('Xác nhận', 'Xóa phương thức này?', [
      { text: 'Hủy' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await deletePaymentMethod({ id }, token);
          Alert.alert('Đã xóa', 'Phương thức đã bị xóa');
          navigation.goBack();
        } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
      } }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa phương thức thanh toán</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

      <Text style={styles.label}>Tên</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

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
