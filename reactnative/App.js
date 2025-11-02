 import { StatusBar } from 'expo-status-bar';
 import { NavigationContainer } from '@react-navigation/native';
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 import RootNavigator from './src/navigation/RootNavigator';
 import { View } from 'react-native';
 import { AuthProvider } from './src/context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <View style={{ flex: 1 }}>
            <RootNavigator />
            <StatusBar style="auto" />
          </View>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
