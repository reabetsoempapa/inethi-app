import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AppBarComponent from './components/AppBarComponent';
import WebViewComponent from './components/WebViewComponent';
import PaymentPage from './pages/Wallet Pages/PaymentPage';
import RegisterPage from './pages/RegisterPage';
import { BalanceProvider } from './context/BalanceContext';
import ServiceContainer from './components/ServiceContainer';
import FdroidAppstore from './components/FdroidAppstore';
import MapPage from './pages/MapPage';
import WalletCategoriesPage from './pages/Wallet Pages/Wallet';
import RecipientDetailsScreen from './pages/Wallet Pages/RecipientDetails';
import WalletDetailsPage from './pages/Wallet Pages/WalletDetails';
import AddRecipientScreen from './pages/Wallet Pages/AddRecipients';
import ViewRecipientsScreen from './pages/Wallet Pages/ViewRecipients';
import CreateWalletPage from './pages/Wallet Pages/CreateWallet';
import PaymentHistory from './pages/Wallet Pages/PaymentHistory';
import PaymentSuccess from './pages/Wallet Pages/PaymentSuccess';
import PaymentUnsuccessful from './pages/Wallet Pages/PaymentFail';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/Settings';
import SetupPIN from './pages/Wallet Pages/PinScreen';
import HotspotOptionsPage from './pages/HotspotOptionsPage';
import RequestNodePage from './pages/RequestNodePage'; // Ensure this is imported

// Import the ReviewPage component
import ReviewPage from './pages/ReviewPage'; // Update this path according to where ReviewPage is located
// Import CopilotProvider
import { CopilotProvider } from 'react-native-copilot';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// Home Page Stack
const HomePageStack = ({ logout }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Home" logout={logout} />
          ),
        }}
      >
        {props => <HomePage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="RequestNode"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="App Store" logout={logout} />
          ),
        }}
      >
        {props => <RequestNodePage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="HotspotOptions"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Web View" logout={logout} />
          ),
        }}
      >
        {props => <HotspotOptionsPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="Map"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Map" logout={logout} />
          ),
        }}
      >
        {props => <MapPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="ReviewPage"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Reviews" logout={logout} />
          ),
        }}>
        {props => <ReviewPage {...props} logout={logout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};// Wallet Page Stack
const WalletPageStack = ({ logout }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="WalletCategories"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Wallet" logout={logout} />
          ),
        }}>
        {props => <WalletCategoriesPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="WalletDetails"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Wallet Details" logout={logout} />
          ),
        }}>
        {props => <WalletDetailsPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="AddRecipient"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Recipient" logout={logout} />
          ),
        }}>
        {props => <AddRecipientScreen {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="Recipients"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Recipients" logout={logout} />
          ),
        }}>
        {props => <ViewRecipientsScreen {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="SetupPIN"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Pin" logout={logout} />
          ),
        }}>
        {props => <SetupPIN {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="CreateWallet"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Create Wallet" logout={logout} />
          ),
        }}>
        {props => <CreateWalletPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="RecipientDetails"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Recipient Details" logout={logout} />
          ),
        }}>
        {props => <RecipientDetailsScreen {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="Payment"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Payment" logout={logout} />
          ),
        }}>
        {props => <PaymentPage {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="PaymentHistory"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Payment History" logout={logout} />
          ),
        }}>
        {props => <PaymentHistory {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="PaymentSuccess"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Payment Success" logout={logout} />
          ),
        }}>
        {props => <PaymentSuccess {...props} logout={logout} />}
      </Stack.Screen>
      <Stack.Screen
        name="PaymentUnsuccessful"
        options={{
          header: ({ navigation }) => (
            <AppBarComponent title="Payment Unsuccessful" logout={logout} />
          ),
        }}>
        {props => <PaymentUnsuccessful {...props} logout={logout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Main Tabs
const MainTabs = ({ navigation, logout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Wallet') {
            iconName = 'wallet-outline';
          } else if (route.name === 'Help') {
            iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [{ display: 'flex' }, null],
      })}>
      <Tab.Screen name="Home" options={{ headerShown: false }}>
        {props => <HomePageStack {...props} logout={logout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Wallet"
        options={{ headerShown: false }} // Keep this false as we're handling headers in WalletPageStack
      >
        {props => <WalletPageStack {...props} logout={logout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Help"
        options={{ headerShown: false }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            console.log(
              'Navigating to WalletCategories with startTutorial flag',
            );
            navigation.navigate('Wallet', {
              screen: 'WalletCategories',
              params: { startTutorial: true },
            });
          },
        }}>
        {props => <HelpPage {...props} />}
      </Tab.Screen>
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

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('tokenExpiry');
    await AsyncStorage.removeItem('refreshToken');
    setUserToken(null);
  }, []);

  const handleLoginSuccess = async (token, expiresIn, refresh_token) => {
    const expiryDate = new Date().getTime() + expiresIn * 1000;
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('tokenExpiry', expiryDate.toString());
    await AsyncStorage.setItem('refreshToken', refresh_token);
    setUserToken(token);
  };

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <BalanceProvider logout={logout}>
          <NavigationContainer>
            <CopilotProvider
              overlay="svg"
              animated={true}
              tooltipStyle={{
                backgroundColor: '#e1e8f2',
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
              stepNumberStyle={{
                backgroundColor: '#4285F4',
                color: '#FFFFFF',
              }}
              arrowColor={'rgba(0, 0, 0, 0.8)'}
              verticalOffset={55}>
              <Stack.Navigator>
                {userToken ? (
                  <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                    {props => <MainTabs {...props} logout={logout} />}
                  </Stack.Screen>
                ) : (
                  <>
                    <Stack.Screen name="Login" options={{ headerShown: false }}>
                      {props => (
                        <LoginPage
                          {...props}
                          onLoginSuccess={handleLoginSuccess}
                        />
                      )}
                    </Stack.Screen>
                    <Stack.Screen
                      name="Register"
                      options={{ headerTitle: 'Register' }}>
                      {props => (
                        <RegisterPage
                          {...props}
                          onRegisterSuccess={() => { }}
                          onLoginSuccess={handleLoginSuccess}
                        />
                      )}
                    </Stack.Screen>
                  </>
                )}
              </Stack.Navigator>
            </CopilotProvider>
          </NavigationContainer>
        </BalanceProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
