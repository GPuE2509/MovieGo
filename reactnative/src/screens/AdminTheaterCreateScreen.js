import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { createTheater } from '../services/TheaterService';

export default function AdminTheaterCreateScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    try {
      setSaving(true);
      await createTheater({ name, address }, token);
      Alert.alert('Thành công', 'Đã tạo rạp');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo rạp</Text>
      <Text style={styles.label}>Tên</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      <View style={{ height: 12 }} />
      <Button title={saving ? 'Đang tạo...' : 'Tạo'} onPress={onCreate} disabled={saving || !name} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }
});
