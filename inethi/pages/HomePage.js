import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Button, Card, Title, Dialog, Portal } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBalance } from '../context/BalanceContext';
import * as amplitude from '@amplitude/analytics-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../utils/tokenUtils';
import {
  checkInternetConnection,
  checkWirelessConnection,
  syncAnalyticsEvents,
  logAnalyticsEvent,
  fetchServices,
} from '../service/HomePageService'; // Importing from external service
import { recordFeatureUsage } from '../service/Metric';

amplitude.init('d641bfb8c1944a8894e65cc64309318e');

const HomePage = ({ logout }) => {
  const route = useRoute();
  const navigation = useNavigation();

  const [hasWallet, setHasWallet] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectedToWireless, setIsConnectedToWireless] = useState(false);
  const [isConnectedToInternet, setIsConnectedToInternet] = useState(false);
  const { balance, fetchBalance } = useBalance();

  const [categories, setCategories] = useState({
    Wallet: [
      {
        name: 'Wallet',
        action: () =>
          navigation.navigate('Wallet', {
            screen: 'WalletCategories',
          }),
        url: '',
      },
    ],
    Navigator: [
      { name: 'Hotspot Services', action: () => handleHotspotOptionsClick() },
    ],
    Appstore: [{ name: 'AppStore', action: () => handleAppstoreClick() }],
  });

  const [internetData, setInternetData] = useState(null);
  const [username, setUsername] = useState(null);
  const [progress, setProgress] = useState(0); // For progress bar

  const handleAppstoreClick = () => {
    logAnalyticsEvent('navigate_to_AppStore', { feature: 'App Store' });//recording app navigation using amplitude
    recordFeatureUsage("AppStore");//recording app navigation using prometheus
    navigation.navigate('AppStore'); // navigating to appstore
  };

  const handleHotspotOptionsClick = () => {
    logAnalyticsEvent('navigate_to_HotspotOptions', { feature: 'Hotspot Options' });
    navigation.navigate('HotspotOptions'); // Navigates to HotspotOptionsPage
  };

  // Fetch username and internet data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken();
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        fetchUserInternetData(storedUsername, token);
      }
    };

    const fetchUserInternetData = async (username, token) => {
      try {
        const response = await fetch('http://localhost:8000/accounts/users/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const user = data.find(user => user.username === username);

        if (user) {
          setInternetData(user.profile); // Access user profile
          updateProgress(user.profile); // Update progress bar
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const updateProgress = (profile) => {
      const dataReceived = profile.bytes_recv || 0;
      const dataSent = profile.bytes_sent || 0;
      const totalData = dataReceived + dataSent;

      if (totalData > 0) {
        const progressValue = totalData / 1000000; // Example: Divide by 1MB for the progress bar
        setProgress(progressValue);
      } else {
        setProgress(0); // Default progress
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkStatuses = async () => {
      const wirelessStatus = await checkWirelessConnection();
      const internetStatus = await checkInternetConnection();
      setIsConnectedToWireless(wirelessStatus);
      setIsConnectedToInternet(internetStatus);

      if (internetStatus) {
        syncAnalyticsEvents();
      }
    };

    checkStatuses();
    const intervalId = setInterval(checkStatuses, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const servicesData = await fetchServices(); // Fetching services externally
        const fetchedCategories = { ...categories };

        Object.entries(servicesData).forEach(([category, services]) => {
          fetchedCategories[category] = services.map(service => ({
            name: service.name,
            url: service.url,
            action: () => navigation.navigate('WebView', { url: service.url }),
          }));
        });

        setCategories(fetchedCategories);
        await fetchBalance();
      } catch (err) {
        console.error('Initialization error:', err);
        setError(`Initialization failed: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const renderButtons = buttons => {
    const buttonRows = [];
    for (let i = 0; i < buttons.length; i++) {
      const { name, action, url } = buttons[i];
      buttonRows.push(
        <Button
          key={i}
          mode="contained"
          onPress={() => {
            if (action) {
              action();
            } else if (url) {
              navigation.navigate('WebView', { url });
            }
          }}
          style={styles.button}
          labelStyle={styles.buttonText}
          icon={() => {
            if (name === 'Hotspot Services') {
              // return <Ionicons name="map-outline" size={20} color="#FFFFFF" />;
            }
            return null;
          }}
        >
          {name}
        </Button>,
      );
    }
    return buttonRows;
  };

  const renderCategoryCards = () =>
    Object.entries(categories).map(([category, buttons], index) => (
      <Card key={index} style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{category}</Title>
          {renderButtons(buttons)}
        </Card.Content>
      </Card>
    ));

  const InternetDataCard = () => {
    const totalData = 20; // Set default total data
    const remainingData = internetData
      ? totalData - (internetData.bytes_recv + internetData.bytes_sent) / 1000000
      : totalData;
    const progress = remainingData / totalData;

    return (
      <Card style={styles.internetDataCard}>
        <View style={styles.internetDataContent}>
          <Ionicons name="download-outline" size={30} color="#FFFFFF" />
          <View>
            <Text style={styles.internetDataTitle}>Internet Data</Text>
            <Text style={styles.internetDataText}>
              {remainingData.toFixed(2)}GB left of {totalData}GB Data
            </Text>
          </View>
        </View>
        <View style={styles.internetDataBarContainer}>
          <View
            style={[
              styles.internetDataBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: progress > 0.5 ? '#76c7c0' : '#ff9800',
              },
            ]}
          />
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <Ionicons name="wifi" size={30} color="#FFFFFF" />
            <Text style={styles.statusTitle}>iNethi Wireless</Text>
            <View style={styles.statusIndicatorContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnectedToWireless ? 'green' : 'red' },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnectedToWireless ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <Ionicons name="globe" size={30} color="#FFFFFF" />
            <Text style={styles.statusTitle}>Internet</Text>
            <View style={styles.statusIndicatorContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnectedToInternet ? 'green' : 'red' },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnectedToInternet ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <InternetDataCard />

      {renderCategoryCards()}

      <Portal>
        {isLoading && (
          <Dialog visible={true}>
            <Dialog.Content>
              <ActivityIndicator size="large" />
            </Dialog.Content>
          </Dialog>
        )}
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statusCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    padding: 10,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4285F4',
    marginVertical: 5,
  },
  card: {
    marginBottom: 10,
  },
  title: {
    marginBottom: 8,
    color: '#4285F4',
  },
  internetDataCard: {
    backgroundColor: '#4285F4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  internetDataContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  internetDataTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  internetDataText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
  },
  internetDataBarContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  internetDataBar: {
    height: 5,
    borderRadius: 5,
  },
});

export default HomePage;
