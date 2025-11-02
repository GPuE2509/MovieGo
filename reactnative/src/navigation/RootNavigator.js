 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import { Ionicons } from '@expo/vector-icons';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

export default function RootNavigator() {
  return (
    <Stack.Navigator>
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
      <Stack.Screen name="Login" component={LoginScreen} />
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
        {() => (
          <ProtectedScreen>
            <AdminFestivalEditScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminMovieCreate">
        {() => (
          <ProtectedScreen>
            <AdminMovieCreateScreen />
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
        {() => (
          <ProtectedScreen>
            <AdminTheaterEditScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminTheaterCreate">
        {() => (
          <ProtectedScreen>
            <AdminTheaterCreateScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPaymentEdit">
        {() => (
          <ProtectedScreen>
            <AdminPaymentEditScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminPaymentCreate">
        {() => (
          <ProtectedScreen>
            <AdminPaymentCreateScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminMovieEdit">
        {() => (
          <ProtectedScreen>
            <AdminMovieEditScreen />
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
    </Stack.Navigator>
  );
}
