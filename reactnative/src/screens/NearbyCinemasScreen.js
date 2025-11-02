import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import { geocodeAddress, getNearbyCinemas } from '../services/NearbyCinemasService';

export default function NearbyCinemasScreen() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [error, setError] = useState('');

  const onSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const geo = await geocodeAddress(address);
      const list = await getNearbyCinemas(geo.lat, geo.lon, 10, null, 20);
      setCinemas(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rạp gần tôi</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ..."
      />
      <Button title={loading ? 'Đang tìm...' : 'Tìm rạp gần đây'} onPress={onSearch} disabled={loading || !address} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={cinemas}
        keyExtractor={(item, idx) => String(item?.id ?? idx)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item?.name || 'Theater'}</Text>
            {item?.address && <Text style={styles.itemSub}>{String(item.address)}</Text>}
            {item?.distance && <Text style={styles.itemSub}>~ {String(item.distance)} km</Text>}
          </View>
        )}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: 'red', marginTop: 8 },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  itemTitle: { fontWeight: '600' },
  itemSub: { color: '#666', marginTop: 2 }
});
