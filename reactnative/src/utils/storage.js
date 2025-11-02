import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get(key) {
    try { return await AsyncStorage.getItem(key); } catch { return null; }
  },
  async set(key, value) {
    try { await AsyncStorage.setItem(key, value); } catch {}
  },
  async remove(key) {
    try { await AsyncStorage.removeItem(key); } catch {}
  }
};
