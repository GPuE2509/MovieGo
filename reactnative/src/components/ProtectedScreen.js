import { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProtectedScreen({ children }) {
  const { token } = useContext(AuthContext);
  const navigation = useNavigation();

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Yêu cầu đăng nhập</Text>
        <Button title="Đi tới Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 }
});
