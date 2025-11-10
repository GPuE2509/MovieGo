import { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({ 
  token: null, 
  user: null,
  setToken: () => {},
  setUser: () => {}
});

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken) setTokenState(storedToken);
      if (storedUser) setUserState(JSON.parse(storedUser));
    };
    loadAuthData();
  }, []);

  const setToken = async (t, userData = null) => {
    setTokenState(t);
    if (t) {
      await AsyncStorage.setItem('token', t);
      if (userData) {
        setUserState(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } else {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUserState(null);
    }
  };

  const setUser = async (userData) => {
    setUserState(userData);
    if (userData) {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  const value = useMemo(() => ({ 
    token, 
    user,
    setToken,
    setUser
  }), [token, user]);
  return children ? <AuthContext.Provider value={value}>{children}</AuthContext.Provider> : null;
}
