import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AppBarComponent from './components/AppBarComponent';
import WebViewComponent from './components/WebViewComponent';
import PaymentPage from './pages/PaymentPage';
import RegisterPage from './pages/RegisterPage';
import {BalanceProvider} from './context/BalanceContext';
import ServiceContainer from './components/ServiceContainer';
import AppList from './components/AppList';
import MapPage from './pages/MapPage';
import WalletCategoriesPage from './pages/Wallet';
import RecipientDetailsScreen from './pages/RecipientDetails';
import WalletDetailsPage from './pages/WalletDetails';
import AddRecipientScreen from './pages/AddRecipients';
import ViewRecipientsScreen from './pages/ViewRecipients';
import CreateWalletPage from './pages/CreateWallet';
import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentUnsuccessful from './pages/PaymentFail';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/Settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Page Stack
const HomePageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Home" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="AppStore"
        component={AppList}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="App Store" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="WebView"
        component={WebViewComponent}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Web View" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="ServiceContainer"
        component={ServiceContainer}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent
              title="Service Container"
              logout={options.logout}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Map"
        component={MapPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Map" logout={options.logout} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

// Wallet Page Stack
const WalletPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WalletCategories"
        component={WalletCategoriesPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent
              title="Wallet Categories"
              logout={options.logout}
            />
          ),
        }}
      />
      <Stack.Screen
        name="WalletDetails"
        component={WalletDetailsPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Wallet Details" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="AddRecipient"
        component={AddRecipientScreen}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Add Recipient" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="ViewRecipients"
        component={ViewRecipientsScreen}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="View Recipients" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="CreateWallet"
        component={CreateWalletPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Create Wallet" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="RecipientDetails"
        component={RecipientDetailsScreen}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent
              title="Recipient Details"
              logout={options.logout}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment History" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment Success" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentUnsuccessful"
        component={PaymentUnsuccessful}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent
              title="Payment Unsuccessful"
              logout={options.logout}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

// Payment Page Stack
const PaymentPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Payment"
        component={PaymentPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment History" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccess}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Payment Success" logout={options.logout} />
          ),
        }}
      />
      <Stack.Screen
        name="PaymentUnsuccessful"
        component={PaymentUnsuccessful}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent
              title="Payment Unsuccessful"
              logout={options.logout}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

// Help Page Stack
const HelpPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Help"
        component={HelpPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Help" logout={options.logout} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

// Settings Page Stack
const SettingsPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          header: ({navigation, route, options}) => (
            <AppBarComponent title="Settings" logout={options.logout} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Routes with Bottom Tabs for Authenticated Users
const AppRoutes = ({logout, userToken}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Help') {
            iconName = 'help-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [{display: 'flex'}, null],
      })}>
      <Tab.Screen
        name="Home"
        component={HomePageStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Help"
        component={HelpPageStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsPageStack}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    loadToken();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('tokenExpiry');
    await AsyncStorage.removeItem('refreshToken');
    setUserToken(null); // This will trigger a re-render and redirect to the login page
  };

  const handleLoginSuccess = async (token, expiresIn, refresh_token) => {
    const expiryDate = new Date().getTime() + expiresIn * 1000;
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('tokenExpiry', expiryDate.toString()); // Store the expiry time
    await AsyncStorage.setItem('refreshToken', refresh_token);
    setUserToken(token);
  };

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <BalanceProvider logout={logout}>
          <NavigationContainer>
            {userToken ? (
              <Stack.Navigator>
                {/* Main App Routes */}
                <Stack.Screen
                  name="AppRoutes"
                  component={AppRoutes}
                  options={{headerShown: false}}
                />
                {/* Wallet Stack for Authenticated Users */}
                <Stack.Screen
                  name="WalletPageStack"
                  component={WalletPageStack}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator>
                <Stack.Screen name="Login" options={{headerShown: false}}>
                  {props => (
                    <LoginPage {...props} onLoginSuccess={handleLoginSuccess} />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="Register"
                  component={RegisterPage}
                  options={{headerTitle: 'Register'}}
                />
              </Stack.Navigator>
            )}
          </NavigationContainer>
        </BalanceProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
