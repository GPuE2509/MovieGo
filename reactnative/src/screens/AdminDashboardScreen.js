 import { View, Text, StyleSheet, Button } from 'react-native';
 import { useNavigation } from '@react-navigation/native';

 export default function AdminDashboardScreen() {
   const nav = useNavigation();
   return (
     <View style={styles.container}>
       <Text style={styles.title}>Admin Dashboard</Text>
       <View style={styles.row}><Button title="Người dùng" onPress={() => nav.navigate('AdminUsers')} /></View>
       <View style={styles.row}><Button title="Phim" onPress={() => nav.navigate('AdminMovies')} /></View>
       <View style={styles.row}><Button title="Rạp" onPress={() => nav.navigate('AdminTheaters')} /></View>
       <View style={styles.row}><Button title="Phòng chiếu" onPress={() => nav.navigate('AdminScreens')} /></View>
       <View style={styles.row}><Button title="Thanh toán" onPress={() => nav.navigate('AdminPayments')} /></View>
       <View style={styles.row}><Button title="Khuyến mãi" onPress={() => nav.navigate('AdminPromotions')} /></View>
       <View style={styles.row}><Button title="Liên hoan phim" onPress={() => nav.navigate('AdminFestivals')} /></View>
       <View style={styles.row}><Button title="Thống kê" onPress={() => nav.navigate('Statistics')} /></View>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  row: { marginTop: 8 }
});
