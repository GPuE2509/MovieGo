import { View, Text, StyleSheet } from 'react-native';

export default function PolicyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Policy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' }
});
