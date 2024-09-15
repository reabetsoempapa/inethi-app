import React, {useState} from 'react';
import {View, StyleSheet, Alert, ScrollView, Text} from 'react-native';
import {Button, TextInput, Paragraph} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getToken} from '../../utils/tokenUtils';
import {useBalance} from '../../context/BalanceContext';

const CreateWalletPage = () => {
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletCreateEndpoint = '/wallet/create/';
  const navigation = useNavigation();
  const {fetchBalance} = useBalance();
  const [walletName, setWalletName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const storePin = async (walletAddress, pin) => {
    try {
      await AsyncStorage.setItem(`@wallet_pin_${walletAddress}`, pin);
    } catch (e) {
      console.error('Failed to save the PIN.', e);
      Alert.alert('Error', 'Failed to save the PIN. Please try again.');
    }
  };

  const handleCreateWallet = async () => {
    if (!walletName) {
      Alert.alert('Error', 'Please enter a wallet name.');
      return;
    }

    if (pin.length !== 5 || !/^\d+$/.test(pin)) {
      Alert.alert('Error', 'PIN must be exactly 5 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

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
        await storePin(response.data.address, pin);
        Alert.alert(
          'Success',
          `Wallet created successfully! Address: ${response.data.address}, Name: ${response.data.name}`,
        );
        fetchBalance();
        navigation.goBack();
      }
    } catch (error) {
      await storePin(response.data.address, pin);

      console.error('Error creating wallet:', error);
      if (error.response) {
        if (error.response.status === 400) {
          setError(
            'Cannot connect to the iNethi server. Please check your Internet connection.',
          );
        } else if (error.response.status === 401) {
          setError('Authentication credentials were not provided.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to create a wallet.');
        } else if (error.response.status === 409) {
          setError('You already have a wallet.');
        } else if (error.response.status === 500) {
          setError('Error creating wallet. Please contact iNethi support.');
        } else {
          setError(`Failed to create wallet: ${error.message}`);
        }
      } else {
        setError(`Failed to create wallet: ${error.message}`);
      }
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
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
          onChangeText={text => setWalletName(text)}
          style={styles.input}
          mode="outlined"
          placeholder="Enter a name for your wallet"
        />
        <TextInput
          label="5-Digit PIN"
          value={pin}
          onChangeText={text => setPin(text)}
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
          onChangeText={text => setConfirmPin(text)}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          maxLength={5}
          secureTextEntry
          placeholder="Re-enter your 5-digit PIN"
        />
        {error && <Paragraph style={styles.error}>{error}</Paragraph>}
        <Button
          mode="contained"
          onPress={handleCreateWallet}
          loading={isLoading}
          style={styles.createButton}>
          Create Wallet
        </Button>
      </ScrollView>
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
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
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
