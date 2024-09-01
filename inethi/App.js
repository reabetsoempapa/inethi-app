/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NativeRouter, Route, Routes, useLocation} from 'react-router-native';
import {Provider as PaperProvider} from 'react-native-paper';
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
import {vexo} from 'vexo-analytics';
import WalletCategoriesPage from './pages/Wallet';
import RecipientDetailsScreen from './pages/RecipientDetails';
import WalletDetailsPage from './pages/WalletDetails';
import AddRecipientScreen from './pages/AddRecipients';
import ViewRecipientsScreen from './pages/ViewRecipients';
import CreateWalletPage from './pages/CreateWallet';
import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentUnsuccessful from './pages/PaymentUnsucessful';

// You may want to wrap this with `if (!__DEV__) { ... }` to only run Vexo in production.
vexo('707528fb-5be6-49d1-9a78-5afe749580cc');

const AppRoutes = ({
  logout,
  userToken,
  handleLoginSuccess,
  handleRegisterSuccess,
}) => {
  const location = useLocation();
  const hideAppBarRoutes = ['/map']; // Add routes here where AppBar should not be shown

  const getTitle = pathname => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/payment':
        return 'Payment';
      case '/appstore':
        return 'App Store';
      case '/wallet-categories':
        return 'Wallet Categories';
      case '/view-recipients':
        return 'View Recipients';
      case '/add-recipient':
        return 'Add Recipient';
      case '/create-Wallet':
        return 'Create Wallet';
      case '/payment-history':
        return 'Payment History';
      case '/payment-success':
        return 'Payment Success';
      case '/payment-unsuccessful':
        return 'Payment Unsuccessful';
      default:
        return 'iNethi App'; // Default title for unknown routes
    }
  };

  return (
    <>
      {!hideAppBarRoutes.includes(location.pathname) && (
        <AppBarComponent logout={logout} title={getTitle(location.pathname)} />
      )}
      <Routes>
        {userToken ? (
          <>
            <Route exact path="/" element={<HomePage logout={logout} />} />
            <Route path="/payment" element={<PaymentPage logout={logout} />} />
            <Route path="/webview" element={<WebViewComponent />} />
            <Route path="/container" element={<ServiceContainer />} />
            <Route path="/appstore" element={<AppList />} />
            <Route path="/map" element={<MapPage />} />
            <Route
              path="/wallet-categories"
              element={<WalletCategoriesPage />}
            />
            <Route path="/view-recipients" element={<ViewRecipientsScreen />} />
            <Route path="/add-recipient" element={<AddRecipientScreen />} />
            <Route path="/create-Wallet" element={<CreateWalletPage />} />

            <Route
              path="/recipient-details"
              element={<RecipientDetailsScreen />}
            />
            <Route path="/wallet-details" element={<WalletDetailsPage />} />

            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route
              path="/payment-unsuccessful"
              element={<PaymentUnsuccessful />}
            />
          </>
        ) : (
          <>
            <Route
              path="*"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={
                <RegisterPage
                  onLoginSuccess={handleLoginSuccess}
                  onRegisterSuccess={handleRegisterSuccess}
                />
              }
            />
          </>
        )}
      </Routes>
    </>
  );
};

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

  const handleRegisterSuccess = () => {
    alert('Registration successful!');
  };

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <BalanceProvider logout={logout}>
          <NativeRouter>
            <AppRoutes
              logout={logout}
              userToken={userToken}
              handleLoginSuccess={handleLoginSuccess}
              handleRegisterSuccess={handleRegisterSuccess}
            />
          </NativeRouter>
        </BalanceProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
