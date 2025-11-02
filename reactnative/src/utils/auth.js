import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getToken() {
  try { return await AsyncStorage.getItem('token'); } catch { return null; }
}

export async function setToken(token) {
  try { await AsyncStorage.setItem('token', token); } catch {}
}

export async function clearToken() {
  try { await AsyncStorage.removeItem('token'); } catch {}
}
