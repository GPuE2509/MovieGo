import { View, Text, StyleSheet } from 'react-native';

export default function FilmWeekScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Film Week</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' }
});
