import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, Switch } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { getTheaterById, updateTheater, deleteTheater } from '../services/TheaterService';

export default function AdminTheaterEditScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { id } = route.params ?? {};
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-theater-detail', id],
    queryFn: () => getTheaterById(id, token),
    enabled: !!id && !!token,
  });

  const t = data?.data?.data || data?.data || {};
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (t && Object.keys(t).length > 0) {
      setName(t?.name || '');
      setAddress(t?.address || '');
      setCity(t?.city || '');
      setPhone(t?.phone || '');
      setEmail(t?.email || '');
      setIsActive(t?.is_active !== undefined ? t.is_active : true);
    }
  }, [t]);

  const onSave = async () => {
    try {
      setSaving(true);
      const theaterData = {
        name,
        address,
        city,
        phone,
        email,
        is_active: isActive
      };
      await updateTheater(id, theaterData, token);
      
      // Invalidate theater queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin-theaters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-theater-detail', id] });
      
      Alert.alert('Thành công', 'Đã cập nhật rạp');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  const onDelete = () => {
    console.log('DELETE BUTTON PRESSED!');
    
    // Test cho web browser
    if (typeof window !== 'undefined') {
      console.log('Running on web - using window.alert');
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa rạp này không?');
      if (confirmed) {
        handleDelete();
      }
    } else {
      console.log('Running on mobile - using Alert.alert');
      Alert.alert('Test', 'Đây là test alert');
    }
  };

  const handleDelete = async () => {
    try { 
      console.log('=== DELETE THEATER DEBUG ===');
      console.log('Theater ID:', id);
      console.log('Token type:', typeof token);
      console.log('Token present:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!id) {
        throw new Error('ID rạp không hợp lệ');
      }
      
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      
      console.log('Calling deleteTheater API...');
      const result = await deleteTheater(id, token); 
      console.log('Delete API result:', result);
      
      // Invalidate theater queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin-theaters'] });
      
      if (typeof window !== 'undefined') {
        window.alert('Rạp đã được xóa thành công');
      } else {
        Alert.alert('Thành công', 'Rạp đã được xóa thành công');
      }
      navigation.goBack(); 
    }
    catch (e) { 
      console.error('=== DELETE ERROR ===');
      console.error('Error type:', typeof e);
      console.error('Error message:', e?.message);
      console.error('Error object:', e);
      console.error('Response data:', e?.response?.data);
      console.error('Response status:', e?.response?.status);
      console.error('===================');
      
      let errorMessage = 'Không thể xóa rạp';
      if (e?.message) {
        errorMessage = e.message;
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      
      if (typeof window !== 'undefined') {
        window.alert('Lỗi xóa rạp: ' + errorMessage);
      } else {
        Alert.alert('Lỗi xóa rạp', errorMessage);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sửa rạp</Text>
      {isLoading && <Text>Đang tải...</Text>}
      {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}

      <Text style={styles.label}>Tên rạp *</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName}
        placeholder="Nhập tên rạp"
        maxLength={255}
      />
      
      <Text style={styles.label}>Địa chỉ *</Text>
      <TextInput 
        style={styles.input} 
        value={address} 
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ"
        maxLength={500}
        multiline
        numberOfLines={2}
      />
      
      <Text style={styles.label}>Thành phố *</Text>
      <TextInput 
        style={styles.input} 
        value={city} 
        onChangeText={setCity}
        placeholder="Nhập thành phố"
        maxLength={100}
      />
      
      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput 
        style={styles.input} 
        value={phone} 
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại"
        maxLength={20}
        keyboardType="phone-pad"
      />
      
      <Text style={styles.label}>Email</Text>
      <TextInput 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail}
        placeholder="Nhập email"
        maxLength={255}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Trạng thái hoạt động</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={{ height: 12 }} />
      <Button 
        title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} 
        onPress={onSave} 
        disabled={saving || !name || !address || !city} 
      />
      <View style={{ height: 8 }} />
      <Button title="Xóa" color="#dc2626" onPress={onDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 8,
    marginBottom: 8 
  }
});
