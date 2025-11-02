 import { View, Text, StyleSheet, Button } from 'react-native';
 import { useContext, useMemo } from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { AuthContext } from '../context/AuthContext';
 import jwtDecode from 'jwt-decode';
 import { getProfile } from '../services/ProfileService';

 export default function ProfileScreen() {
   const { token, setToken } = useContext(AuthContext);
   const userId = useMemo(() => {
     try {
       if (!token) return null;
       const d = jwtDecode(token);
       return d?.userId || d?.sub || d?.id || null;
     } catch { return null; }
   }, [token]);

   const { data, isLoading, error } = useQuery({
     queryKey: ['profile', userId],
     queryFn: () => getProfile(userId),
     enabled: !!userId,
   });

   return (
     <View style={styles.container}>
       <Text style={styles.title}>Hồ sơ</Text>
       {!userId && <Text>Không xác định được người dùng từ token.</Text>}
       {isLoading && <Text>Đang tải...</Text>}
       {error && <Text style={{ color: 'red' }}>Lỗi: {String(error?.message || error)}</Text>}
       {!!data && (
         <View style={{ gap: 6 }}>
           <Text>Tên: {String(data?.firstName || '')} {String(data?.lastName || '')}</Text>
           <Text>Email: {String(data?.email || '')}</Text>
           <Text>Điện thoại: {String(data?.phone || '')}</Text>
           <Text>Địa chỉ: {String(data?.address || '')}</Text>
         </View>
       )}
       <View style={{ height: 12 }} />
       <Button title="Đăng xuất" onPress={() => setToken(null)} />
     </View>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' }
});
