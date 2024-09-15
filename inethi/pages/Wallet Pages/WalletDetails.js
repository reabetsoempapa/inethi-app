import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Button,
  Title,
  Paragraph,
  IconButton,
  useTheme,
  Card,
} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import {getToken} from '../../utils/tokenUtils';

const WalletDetailsPage = () => {
  const theme = useTheme();
  const route = useRoute();
  const {walletAddress} = route.params || {};
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletDetailsEndpoint = `/wallet/details`;

  const [walletDetails, setWalletDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeRef, setQrCodeRef] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      fetchWalletDetails();
    } else {
      Alert.alert('Error', 'No wallet address provided.');
      setIsLoading(false);
    }
  }, [walletAddress]);

  const fetchWalletDetails = async () => {
    console.log('Fetching Wallet details');
    setIsLoading(true);
    try {
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleError(error);
    }
  };

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Wallet Details</Title>
      {walletDetails ? (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={walletDetails.wallet_address}
                size={200}
                getRef={ref => setQrCodeRef(ref)}
              />
            </View>
            <View style={styles.walletAddressContainer}>
              <Paragraph style={styles.walletAddress}>
                {walletDetails.wallet_address}
              </Paragraph>
              <IconButton
                icon="content-copy"
                size={24}
                onPress={handleCopyAddress}
              />
            </View>
            <Button
              mode="contained"
              onPress={handleDownloadQrCode}
              style={styles.downloadButton}>
              Download QR Code
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Paragraph style={styles.errorText}>
          Error loading wallet details.
        </Paragraph>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginTop: 20,
  },
  cardContent: {
    alignItems: 'center',
  },
  qrCodeContainer: {
    marginBottom: 20,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletAddress: {
    flex: 1,
  },
  downloadButton: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default WalletDetailsPage;
