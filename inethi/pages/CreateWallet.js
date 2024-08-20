import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {
  Button,
  TextInput,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import axios from 'axios';
import {getToken} from '../utils/tokenUtils';
import {useBalance} from '../context/BalanceContext';

const CreateWalletPage = () => {
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletCreateEndpoint = '/wallet/create/';
  const navigate = useNavigate();
  const {fetchBalance} = useBalance();
  const [walletName, setWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWallet = async () => {
    if (!walletName) {
      Alert.alert('Error', 'Please enter a wallet name.');
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

      setIsLoading(false);
      if (response.status === 201) {
        Alert.alert(
          'Success',
          `Wallet created successfully! Address: ${response.data.address}, Name: ${response.data.name}`,
        );
        fetchBalance();
        navigate(-1); // Navigate back after successful creation
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating wallet:', error);
      if (error.response) {
        if (error.response.status === 400) {
          Alert.alert(
            'Error',
            'Cannot connect to the iNethi server. Please check your Internet connection.',
          );
        } else if (error.response.status === 401) {
          Alert.alert('Error', 'Authentication credentials were not provided.');
        } else if (error.response.status === 403) {
          Alert.alert(
            'Error',
            'You do not have permission to create a wallet.',
          );
        } else if (error.response.status === 409) {
          Alert.alert('Error', 'You already have a wallet.');
        } else if (error.response.status === 500) {
          Alert.alert(
            'Error',
            'Error creating wallet. Please contact iNethi support.',
          );
        } else {
          Alert.alert('Error', `Failed to create wallet: ${error.message}`);
        }
      } else {
        Alert.alert('Error', `Failed to create wallet: ${error.message}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Paragraph style={styles.title}>Create Wallet</Paragraph>
      <TextInput
        label="Wallet Name"
        value={walletName}
        onChangeText={text => setWalletName(text)}
        style={styles.input}
        mode="outlined"
      />
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          mode="contained"
          onPress={handleCreateWallet}
          style={styles.createButton}>
          Create
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30, // Space between title and input
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    marginBottom: 20, // Space between input and button
    backgroundColor: '#f5f5f5', // Slightly off-white background
    borderRadius: 8,
  },
  createButton: {
    width: '100%',
    backgroundColor: '#0066ff', // Blue background
    paddingVertical: 15,
    borderRadius: 8,
  },
});

export default CreateWalletPage;
