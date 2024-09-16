import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {Button, TextInput, Paragraph, Snackbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getToken} from '../../utils/tokenUtils';
import {useBalance} from '../../context/BalanceContext';
import NetInfo from '@react-native-community/netinfo';

const CreateWalletPage = () => {
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletCreateEndpoint = '/wallet/create/';
  const navigation = useNavigation();
  const {fetchBalance} = useBalance();
  const [walletName, setWalletName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const showSnackbar = useCallback(message => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const storePin = async pin => {
    try {
      await AsyncStorage.setItem('@wallet_pin', pin);
      const storedPin = await AsyncStorage.getItem('@wallet_pin');
      if (storedPin === pin) {
      } else {
        console.error('PIN verification failed');
        showSnackbar('Failed to verify the PIN. Please try again.');
      }
    } catch (e) {
      console.error('Failed to save the PIN.', e);
      showSnackbar('Failed to save the PIN. Please try again.');
    }
  };

  const handleCreateWallet = async () => {
    if (!isOnline) {
      showSnackbar(
        "You're offline. Please connect to the internet and try again.",
      );
      return;
    }

    if (!walletName) {
      showSnackbar('Please enter a wallet name.');
      return;
    }

    if (pin.length !== 5 || !/^\d+$/.test(pin)) {
      showSnackbar('PIN must be exactly 5 digits.');
      return;
    }

    if (pin !== confirmPin) {
      showSnackbar('PINs do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(
        `${baseURL}${walletCreateEndpoint}`,
        {wallet_name: walletName},
        config,
      );

      if (response.status === 201) {
        await storePin(pin);
        showSnackbar('Wallet created successfully!');
        fetchBalance();
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            showSnackbar(
              'Cannot connect to the iNethi server. Please check your Internet connection.',
            );
            break;
          case 401:
            showSnackbar('Authentication failed. Please log in again.');
            break;
          case 403:
            showSnackbar('You do not have permission to create a wallet.');
            break;
          case 409:
            showSnackbar('You already have a wallet.');
            break;
          case 500:
            showSnackbar(
              'Server error. Please try again later or contact support.',
            );
            break;
          default:
            showSnackbar('An error occurred. Please try again.');
        }
      } else {
        showSnackbar(
          'Network error. Please check your connection and try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.headerText}>Create Wallet</Text>
        <TextInput
          label="Wallet Name"
          value={walletName}
          onChangeText={setWalletName}
          style={styles.input}
          mode="outlined"
          placeholder="Enter a name for your wallet"
        />
        <TextInput
          label="5-Digit PIN"
          value={pin}
          onChangeText={setPin}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          maxLength={5}
          secureTextEntry
          placeholder="Enter a 5-digit PIN"
        />
        <TextInput
          label="Confirm PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          maxLength={5}
          secureTextEntry
          placeholder="Re-enter your 5-digit PIN"
        />
        <Button
          mode="contained"
          onPress={handleCreateWallet}
          loading={isLoading}
          style={styles.createButton}>
          Create Wallet
        </Button>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  formContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0066ff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 30,
  },
});

export default CreateWalletPage;
