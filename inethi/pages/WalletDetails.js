import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {Card, Title, Paragraph} from 'react-native-paper';
import {useLocation} from 'react-router-native';
import axios from 'axios';
import {getToken} from '../utils/tokenUtils';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';

const WalletDetailsPage = () => {
  const location = useLocation();
  const {walletAddress} = location.state || {};
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
    console.log('Inside Fetch Wallet details');
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
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Error', 'Authentication credentials were not provided.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'User does not exist.');
        } else if (error.response.status === 417) {
          Alert.alert('Error', 'User does not have a wallet.');
        } else if (error.response.status === 500) {
          Alert.alert(
            'Error',
            'Error checking wallet details. Please contact iNethi support.',
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to check wallet details: ${error.message}`,
          );
        }
      } else {
        Alert.alert(
          'Error',
          `Failed to check wallet details: ${error.message}`,
        );
      }
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
      alert('Permission to access storage was denied');
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
        alert(`QR code saved to ${filePath}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save QR code');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Wallet Details</Title>
          {walletDetails ? (
            <>
              <Paragraph>
                Wallet Address: {walletDetails.wallet_address}
              </Paragraph>
              <QRCode
                value={`${baseURL}/wallet/${walletDetails.wallet_address}/qr_code/`}
                size={200}
                getRef={ref => setQrCodeRef(ref)}
              />
              <Button
                mode="contained"
                onPress={handleDownloadQrCode}
                style={styles.downloadButton}>
                Download QR Code
              </Button>
            </>
          ) : (
            <Paragraph>Error loading wallet details.</Paragraph>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: 20,
  },
});

export default WalletDetailsPage;
