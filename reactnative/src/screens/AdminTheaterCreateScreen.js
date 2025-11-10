import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, Switch } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { createTheater } from '../services/TheaterService';

export default function AdminTheaterCreateScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
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
      await createTheater(theaterData, token);
      
      // Invalidate theater queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin-theaters'] });
      
      Alert.alert('Thành công', 'Đã tạo rạp');
      navigation.goBack();
    } catch (e) { Alert.alert('Lỗi', String(e?.message || e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo rạp</Text>
      
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
        title={saving ? 'Đang tạo...' : 'Tạo rạp'} 
        onPress={onCreate} 
        disabled={saving || !name || !address || !city} 
      />
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
