import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Button, Card, Title, Dialog, Portal } from 'react-native-paper';
import { useNavigate } from 'react-router-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as amplitude from '@amplitude/analytics-react-native';
import analytics from '@react-native-firebase/analytics';
import Ionicons from 'react-native-vector-icons/Ionicons';

amplitude.init('d641bfb8c1944a8894e65cc64309318e');

const HomePage = ({ logout }) => {
  const nextcloudURL = 'https://nextcloud.inethicloud.net';

  const [hasWallet, setHasWallet] = useState(false);
  const navigate = useNavigate();
  const [isCreateWalletDialogOpen, setIsCreateWalletDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectedToWireless, setIsConnectedToWireless] = useState(false);
  const [isConnectedToInternet, setIsConnectedToInternet] = useState(false);

  const [categories, setCategories] = useState({
    Wallet: [
      {
        name: 'Wallet',
        action: () => navigate('/wallet-categories'),
        url: '',
      },
    ],
    Navigator: [{ name: 'FindHotspot', action: () => handleFindHotspotClick() }],
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnectedToInternet(state.isConnected && state.isInternetReachable);
      if (state.isConnected && state.isInternetReachable) {
        uploadStoredEvents();
      }
    });

    checkWirelessConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  const storeEvent = async (eventName, eventProperties) => {
    try {
      const storedEvents = JSON.parse(await AsyncStorage.getItem('trackedEvents')) || [];
      storedEvents.push({ eventName, eventProperties, timestamp: new Date() });
      await AsyncStorage.setItem('trackedEvents', JSON.stringify(storedEvents));
    } catch (error) {
      console.error('Failed to store event:', error);
    }
  };

  const uploadStoredEvents = async () => {
    try {
      const storedEvents = JSON.parse(await AsyncStorage.getItem('trackedEvents')) || [];
      for (let event of storedEvents) {
        // Upload to Amplitude
        amplitude.track(event.eventName, event.eventProperties);
        // Upload to Firebase Analytics
        await analytics().logEvent(event.eventName, event.eventProperties);
      }
      // Clear stored events after upload
      await AsyncStorage.removeItem('trackedEvents');
    } catch (error) {
      console.error('Failed to upload events:', error);
    }
  };

  const handleFindHotspotClick = () => {
    const eventName = 'find_hotspot_button_clicked';
    const eventProperties = { button: 'FindHotspot' };

    if (isConnectedToInternet) {
      amplitude.track(eventName, eventProperties);
      analytics().logEvent('navigate_to_map', { feature: 'Map' });
    } else {
      storeEvent(eventName, eventProperties);
    }

    navigate('/map');
  };

  const checkWirelessConnection = async () => {
    try {
      const response = await fetch(nextcloudURL, { method: 'HEAD' });
      if (response.ok) {
        setIsConnectedToWireless(true);
      } else {
        setIsConnectedToWireless(false);
      }
    } catch (error) {
      setIsConnectedToWireless(false);
    }
  };

  const openURL = url => {
    navigate('/webview', { state: { url } });
  };

  const renderButtons = buttons => {
    const buttonRows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      const pair = buttons.slice(i, i + 2);
      buttonRows.push(
        <View key={i} style={styles.buttonRow}>
          {pair.map(({ name, action, url, requiresWallet, disabled }, idx) => {
            const isDisabled = (requiresWallet && !hasWallet) || disabled;
            return (
              <Button
                key={idx}
                mode="contained"
                onPress={() => {
                  if (action && !isDisabled) {
                    action();
                  } else if (url && !isDisabled) {
                    openURL(url);
                  } else {
                    console.error('Button has no action or URL');
                  }
                }}
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                labelStyle={
                  isDisabled ? styles.buttonTextDisabled : styles.buttonText
                }
                disabled={isDisabled}
                icon={() => {
                  if (name === 'FindHotspot') {
                    return (
                      <Ionicons name="map-outline" size={20} color="#FFFFFF" />
                    );
                  }
                  return null;
                }}>
                {name}
              </Button>
            );
          })}
        </View>,
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
    const totalData = 20; // Total data in GB
    const remainingData = 19; // Remaining data in GB
    const usedData = totalData - remainingData;
    const progress = remainingData / totalData;

    return (
      <Card style={styles.internetDataCard}>
        <View style={styles.internetDataContent}>
          <Ionicons name="download-outline" size={30} color="#FFFFFF" />
          <View>
            <Text style={styles.internetDataTitle}>Internet Data</Text>
            <Text style={styles.internetDataText}>
              {remainingData}GB left of {totalData}GB Data
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
        <Card style={styles.statusCard}>
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
        </Card>
        <Card style={styles.statusCard}>
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
        </Card>
      </View>
      <InternetDataCard />
      {renderCategoryCards(categories)}
      <View style={styles.card}>
        <ActivityIndicator size="large" animating={isLoading} />
      </View>
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
  card: {
    marginBottom: 10,
  },
  title: {
    marginBottom: 8,
    color: '#4285F4',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: '#FFFFFF',
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
