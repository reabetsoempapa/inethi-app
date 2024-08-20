import React, {useState} from 'react';
import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import {Button, TextInput, Paragraph} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import {addRecipient} from '../service/recipient';

const AddRecipientScreen = () => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [recipientWalletName, setRecipientWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddRecipient = async () => {
    setIsLoading(true);
    try {
      await addRecipient(
        recipientName,
        recipientWalletAddress,
        recipientWalletName,
      );
      Alert.alert('Recipient added successfully');
      navigate(-1); // Navigate back to the previous screen
    } catch (error) {
      setError(`Error adding recipient: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="Recipient Name"
        value={recipientName}
        onChangeText={text => setRecipientName(text)}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Recipient Wallet Address"
        value={recipientWalletAddress}
        onChangeText={text => setRecipientWalletAddress(text)}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Recipient Wallet Name"
        value={recipientWalletName}
        onChangeText={text => setRecipientWalletName(text)}
        style={styles.input}
        mode="outlined"
      />
      {error && <Paragraph style={styles.error}>{error}</Paragraph>}
      <Button
        mode="contained"
        onPress={handleAddRecipient}
        loading={isLoading}
        style={styles.addButton}>
        Add Recipient
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigate(-1)}
        style={styles.backButton}>
        Go Back
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default AddRecipientScreen;
