 import axios from 'axios';
 import Constants from 'expo-constants';

 const fromEnv = process.env.EXPO_PUBLIC_API_URL;
 const fromExtra = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
 const API_BASE_URL = fromEnv || fromExtra || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;
