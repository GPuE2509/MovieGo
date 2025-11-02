import { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({ token: null, setToken: () => {} });

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((t) => setTokenState(t));
  }, []);

  const setToken = async (t) => {
    setTokenState(t);
    if (t) await AsyncStorage.setItem('token', t);
    else await AsyncStorage.removeItem('token');
  };

  const value = useMemo(() => ({ token, setToken }), [token]);
  return children ? <AuthContext.Provider value={value}>{children}</AuthContext.Provider> : null;
}
