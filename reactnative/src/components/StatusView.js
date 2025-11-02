import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function StatusView({ loading, error, isEmpty, emptyText = 'Không có dữ liệu', children }) {
  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text style={styles.hint}>Đang tải...</Text>
    </View>
  );
  if (error) return <Text style={styles.error}>Lỗi: {String(error?.message || error)}</Text>;
  if (isEmpty) return <Text style={styles.empty}>{emptyText}</Text>;
  return children;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  hint: { marginTop: 6, color: '#666' },
  error: { color: 'red' },
  empty: { color: '#666' }
});
