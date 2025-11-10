import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
 import HomeScreen from '../screens/HomeScreen';
 import MoviesScreen from '../screens/MoviesScreen';
 import MovieDetailScreen from '../screens/MovieDetailScreen';
 import NewsScreen from '../screens/NewsScreen';
 import NewsDetailScreen from '../screens/NewsDetailScreen';
 import PromotionsScreen from '../screens/PromotionsScreen';
 import PromotionDetailScreen from '../screens/PromotionDetailScreen';
 import TicketPriceScreen from '../screens/TicketPriceScreen';
 import FestivalScreen from '../screens/FestivalScreen';
 import FestivalDetailScreen from '../screens/FestivalDetailScreen';
 import FilmWeekScreen from '../screens/FilmWeekScreen';
 import AboutScreen from '../screens/AboutScreen';
 import ContactScreen from '../screens/ContactScreen';
 import FaqsScreen from '../screens/FaqsScreen';
 import PolicyScreen from '../screens/PolicyScreen';
 import ProfileScreen from '../screens/ProfileScreen';
 import PaymentScreen from '../screens/PaymentScreen';
 import AdminDashboardScreen from '../screens/AdminDashboardScreen';
 import LoginScreen from '../screens/LoginScreen';
 import RegisterScreen from '../screens/RegisterScreen';
 import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
 import ProtectedScreen from '../components/ProtectedScreen';
 import ShowtimesScreen from '../screens/ShowtimesScreen';
 import SeatSelectionScreen from '../screens/SeatSelectionScreen';
 import AdminUsersScreen from '../screens/AdminUsersScreen';
 import NearbyCinemasScreen from '../screens/NearbyCinemasScreen';
 import StatisticsScreen from '../screens/StatisticsScreen';
 import AdminMoviesScreen from '../screens/AdminMoviesScreen';
 import AdminTheatersScreen from '../screens/AdminTheatersScreen';
 import AdminScreensScreen from '../screens/AdminScreensScreen';
 import AdminPaymentsScreen from '../screens/AdminPaymentsScreen';
 import AdminPromotionsScreen from '../screens/AdminPromotionsScreen';
 import AdminFestivalsScreen from '../screens/AdminFestivalsScreen';
 import AdminMovieEditScreen from '../screens/AdminMovieEditScreen';
 import AdminPromotionEditScreen from '../screens/AdminPromotionEditScreen';
 import AdminFestivalEditScreen from '../screens/AdminFestivalEditScreen';
 import AdminMovieCreateScreen from '../screens/AdminMovieCreateScreen';
 import AdminPromotionCreateScreen from '../screens/AdminPromotionCreateScreen';
 import AdminFestivalCreateScreen from '../screens/AdminFestivalCreateScreen';
 import AdminTheaterEditScreen from '../screens/AdminTheaterEditScreen';
 import AdminTheaterCreateScreen from '../screens/AdminTheaterCreateScreen';
 import AdminScreenEditScreen from '../screens/AdminScreenEditScreen';
 import AdminScreenCreateScreen from '../screens/AdminScreenCreateScreen';
 import AdminPaymentEditScreen from '../screens/AdminPaymentEditScreen';
 import AdminPaymentCreateScreen from '../screens/AdminPaymentCreateScreen';
 import AIGeneratorScreen from '../screens/AIGeneratorScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthHeader({ isAuthenticated }) {
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);
  
  const handleLogout = async () => {
    await setToken(null);
  };

  if (isAuthenticated) {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.authButton} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#1a73e8" style={{ marginRight: 4 }} />
          <Text style={styles.authButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity 
          style={[styles.authButton, { marginRight: 12 }]} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.authButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.authButton, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.authButtonText, { color: '#fff' }]}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'home-outline',
            Movies: 'film-outline',
            News: 'newspaper-outline',
            Promotions: 'pricetags-outline',
            Festivals: 'ticket-outline',
            Profile: 'person-outline',
            Admin: 'settings-outline',
          };
          const name = map[route.name] || 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Promotions" component={PromotionsScreen} />
      <Tab.Screen name="Festivals" component={FestivalScreen} />
      <Tab.Screen name="Profile">
        {() => (
          <ProtectedScreen>
            <ProfileScreen />
          </ProtectedScreen>
        )}
      </Tab.Screen>
      <Tab.Screen name="Admin">
        {() => (
          <ProtectedScreen>
            <AdminDashboardScreen />
          </ProtectedScreen>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  registerButton: {
    backgroundColor: '#1a73e8',
  },
  authButtonText: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default function RootNavigator() {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <AuthHeader isAuthenticated={!!token} />,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
      <Stack.Screen name="TicketPrice" component={TicketPriceScreen} />
      <Stack.Screen name="Festival" component={FestivalScreen} />
      <Stack.Screen name="FestivalDetail" component={FestivalDetailScreen} />
      <Stack.Screen name="FilmWeek" component={FilmWeekScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Faqs" component={FaqsScreen} />
      <Stack.Screen name="Policy" component={PolicyScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: 'Đăng nhập',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          title: 'Đăng ký tài khoản',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ 
          title: 'Quên mật khẩu',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen} 
        options={{ 
          title: 'Đặt lại mật khẩu',
          headerShown: false
        }} 
      />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="NearbyCinemas" component={NearbyCinemasScreen} />
      <Stack.Screen name="Statistics">
        {() => (
          <ProtectedScreen>
            <StatisticsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminUsers">
        {() => (
          <ProtectedScreen>
            <AdminUsersScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminMovies">
        {() => (
          <ProtectedScreen>
            <AdminMoviesScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminTheaters">
        {() => (
          <ProtectedScreen>
            <AdminTheatersScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminScreens">
        {() => (
          <ProtectedScreen>
            <AdminScreensScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPayments">
        {() => (
          <ProtectedScreen>
            <AdminPaymentsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPromotions">
        {() => (
          <ProtectedScreen>
            <AdminPromotionsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminFestivals">
        {() => (
          <ProtectedScreen>
            <AdminFestivalsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPromotionEdit">
        {() => (
          <ProtectedScreen>
            <AdminPromotionEditScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminFestivalEdit">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminFestivalEditScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminMovieCreate">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminMovieCreateScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPromotionCreate">
        {() => (
          <ProtectedScreen>
            <AdminPromotionCreateScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminFestivalCreate">
        {() => (
          <ProtectedScreen>
            <AdminFestivalCreateScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminTheaterEdit">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminTheaterEditScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminTheaterCreate">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminTheaterCreateScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPaymentEdit">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminPaymentEditScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPaymentCreate">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminPaymentCreateScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminMovieEdit">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AdminMovieEditScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="Payment">
        {() => (
          <ProtectedScreen>
            <PaymentScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AIGenerator">
        {({ route, navigation }) => (
          <ProtectedScreen>
            <AIGeneratorScreen route={route} navigation={navigation} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
