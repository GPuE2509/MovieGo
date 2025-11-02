import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { createMovie } from '../services/MovieService';

export default function AdminMovieCreateScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    try {
      setSaving(true);
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      if (duration) form.append('duration', String(Number(duration) || ''));
      await createMovie(form, token);
      Alert.alert('Thành công', 'Đã tạo phim');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', String(e?.message || e));
    } finally { setSaving(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo phim</Text>
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline />
      <Text style={styles.label}>Thời lượng (phút)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <View style={{ height: 12 }} />
      <Button title={saving ? 'Đang tạo...' : 'Tạo'} onPress={onCreate} disabled={saving || !title} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }
});
