import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {Button, IconButton, Text, Snackbar} from 'react-native-paper';
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
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const qrCodeRef = useRef();

  useEffect(() => {
    checkNetworkStatus();
    initializeWalletAddress();
    return () => {};
  }, []);

  const checkNetworkStatus = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected);
    if (!state.isConnected) {
      setShowOfflineNotice(true);
    }
  }, []);

  const initializeWalletAddress = async () => {
    let address = routeWalletAddress;
    if (!address) {
      address = await AsyncStorage.getItem('@wallet_address');
    }
    if (address) {
      setWalletAddress(address);
      await AsyncStorage.setItem('@wallet_address', address);
      fetchWalletDetails(address);
    } else {
      setIsLoading(false);
    }
  };

  const fetchWalletDetails = useCallback(
    async address => {
      setIsLoading(true);
      try {
        if (isOnline) {
          const token = await getToken();
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          };

          const response = await axios.get(
            `${baseURL}${walletDetailsEndpoint}`,
            config,
          );
          setWalletDetails(response.data);
          await AsyncStorage.setItem(
            '@wallet_details',
            JSON.stringify(response.data),
          );
        } else {
          const cachedData = await AsyncStorage.getItem('@wallet_details');
          if (cachedData) {
            setWalletDetails(JSON.parse(cachedData));
          } else {
            setWalletDetails({balance: '0.0', wallet_address: address});
          }
        }
      } catch (error) {
        console.error('Error fetching wallet details:', error);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  const handleError = error => {
    setShowOfflineNotice(true);
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
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting permission:', err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleDownloadQrCode = async () => {
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      setShowOfflineNotice(true);
      return;
    }

    if (qrCodeRef.current) {
      qrCodeRef.current.toDataURL(dataURL => {
        RNFS.writeFile(
          `${RNFS.DownloadDirectoryPath}/qrcode_${walletAddress}.png`,
          dataURL,
          'base64',
        )
          .then(success => {
            Alert.alert('Success', `QR code saved to Downloads folder`);
          })
          .catch(err => {
            console.error('Error saving QR code:', err);
            setShowOfflineNotice(true);
          });
      });
    } else {
      setShowOfflineNotice(true);
    }
  };

  const handleCopyAddress = () => {
    Clipboard.setString(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.balanceContainer}>
          {/* <Text style={styles.balanceLabel}>Available Balance</Text> */}
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
      <Snackbar
        visible={showOfflineNotice}
        onDismiss={() => setShowOfflineNotice(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowOfflineNotice(false),
        }}>
        {isOnline
          ? 'An error occurred. Please try again later.'
          : "You're offline. Some features may be limited."}
      </Snackbar>
    </View>
  );
};

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
