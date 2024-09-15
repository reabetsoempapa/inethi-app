import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {Button, IconButton, Text} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getToken} from '../../utils/tokenUtils';
import NetInfo from '@react-native-community/netinfo';

const WalletDetailsPage = () => {
  const route = useRoute();
  const {walletAddress: routeWalletAddress} = route.params || {};
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletDetailsEndpoint = `/wallet/details`;

  const [walletDetails, setWalletDetails] = useState(null);
  const [walletAddress, setWalletAddress] = useState(routeWalletAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const qrCodeRef = useRef();

  useEffect(() => {
    console.log('WalletDetailsPage mounted');
    checkNetworkStatus();
    initializeWalletAddress();
    return () => {
      console.log('WalletDetailsPage unmounted');
    };
  }, []);

  const initializeWalletAddress = async () => {
    console.log('Initializing wallet address');
    if (routeWalletAddress) {
      console.log('Wallet address provided in route:', routeWalletAddress);
      setWalletAddress(routeWalletAddress);
      await AsyncStorage.setItem('@wallet_address', routeWalletAddress);
    } else {
      const storedAddress = await AsyncStorage.getItem('@wallet_address');
      if (storedAddress) {
        console.log('Retrieved stored wallet address:', storedAddress);
        setWalletAddress(storedAddress);
      } else {
        console.log('No wallet address available');
        Alert.alert('Error', 'No wallet address available.');
      }
    }
    fetchWalletDetails();
  };

  const checkNetworkStatus = useCallback(async () => {
    const state = await NetInfo.fetch();
    console.log('Network status:', state.isConnected ? 'Online' : 'Offline');
    setIsOnline(state.isConnected);
  }, []);

  const fetchWalletDetails = useCallback(async () => {
    console.log('Fetching Wallet details');
    setIsLoading(true);
    try {
      if (isOnline) {
        const token = await getToken();
        console.log('Token retrieved');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        console.log(
          'Sending request to:',
          `${baseURL}${walletDetailsEndpoint}`,
        );
        const response = await axios.get(
          `${baseURL}${walletDetailsEndpoint}`,
          config,
        );
        console.log('Wallet details received:', response.data);
        setWalletDetails(response.data);
        await AsyncStorage.setItem(
          '@wallet_details',
          JSON.stringify(response.data),
        );
        console.log('Wallet details cached');
      } else {
        console.log('Offline: Retrieving cached wallet details');
        const cachedData = await AsyncStorage.getItem('@wallet_details');
        if (cachedData) {
          console.log('Cached wallet details found');
          setWalletDetails(JSON.parse(cachedData));
        } else {
          console.log('No cached wallet details available');
          Alert.alert('Offline', 'No cached data available');
        }
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // ... (keep the rest of the functions like handleError, requestStoragePermission, handleDownloadQrCode, and handleCopyAddress)
  const handleError = error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          Alert.alert('Error', 'Authentication credentials were not provided.');
          break;
        case 404:
          Alert.alert('Error', 'User does not exist.');
          break;
        case 417:
          Alert.alert('Error', 'User does not have a wallet.');
          break;
        case 500:
          Alert.alert(
            'Error',
            'Error checking wallet details. Please contact iNethi support.',
          );
          break;
        default:
          Alert.alert(
            'Error',
            `Failed to check wallet details: ${error.message}`,
          );
      }
    } else {
      Alert.alert('Error', `Failed to check wallet details: ${error.message}`);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Number(Platform.Version) >= 33) {
          return true;
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to save the QR code',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        console.log(`Results... ${granted}`);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS does not need this permission
    }
  };

  const handleDownloadQrCode = async () => {
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      Alert.alert('Error', 'Permission to access storage was denied');
      return;
    }

    try {
      const svg = qrCodeRef;

      if (svg) {
        const filePath = `${RNFS.DownloadDirectoryPath}/qrcode.png`;

        const svgData = await new Promise((resolve, reject) => {
          svg.toDataURL(data => {
            resolve(data);
          });
        });

        await RNFS.writeFile(filePath, svgData, 'base64');
        Alert.alert('Success', `QR code saved to ${filePath}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save QR code');
    }
  };
  const handleCopyAddress = () => {
    Clipboard.setString(walletDetails.wallet_address);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('Rendering wallet details');
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {!isOnline && (
          <Text style={styles.offlineText}>Offline: Showing cached data</Text>
        )}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {walletDetails?.balance || '0.0'} Krone
          </Text>
        </View>
        {walletAddress && (
          <>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={walletAddress}
                size={200}
                getRef={ref => (qrCodeRef.current = ref)}
              />
            </View>
            <View style={styles.walletAddressContainer}>
              <Text
                style={styles.walletAddress}
                numberOfLines={1}
                ellipsizeMode="middle">
                {walletAddress}
              </Text>
              <IconButton
                icon="content-copy"
                size={20}
                onPress={handleCopyAddress}
                color="#007AFF"
              />
            </View>
            <Button
              mode="contained"
              onPress={handleDownloadQrCode}
              style={styles.downloadButton}
              contentStyle={styles.downloadButtonContent}
              labelStyle={styles.downloadButtonLabel}
              color="#007AFF">
              Download QR Code
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

// ... (keep the styles as they were)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  balanceContainer: {
    marginTop: 50,
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    marginTop: 35,
    fontSize: 18,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  qrCodeContainer: {
    marginBottom: 20,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 4,
  },
  walletAddress: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  downloadButton: {
    marginTop: 10,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  downloadButtonContent: {
    height: 50,
  },
  downloadButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  offlineText: {
    color: '#007AFF',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default WalletDetailsPage;
