import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Button, TextInput, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {addRecipient} from '../../service/recipient';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {isValidWalletAddress} from './Helpers/WalletAdressValidator';

const AddRecipientScreen = () => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [recipientWalletName, setRecipientWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigation = useNavigation();

  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        setRecipientWalletAddress(codes[0].value);
        setIsScannerOpen(false);
      }
    },
  });

  const handleAddRecipient = async () => {
    if (!isValidWalletAddress(recipientWalletAddress)) {
      setError('Invalid wallet address format');
      return;
    }

    setIsLoading(true);
    try {
      await addRecipient(
        recipientName,
        recipientWalletAddress,
        recipientWalletName,
      );
      Alert.alert('Success', 'Recipient added successfully');
      navigation.goBack();
    } catch (error) {
      setError(`Error adding recipient: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openScanner = async () => {
    const permission = await requestPermission();
    if (permission) {
      setIsScannerOpen(true);
    } else {
      Alert.alert(
        'Camera Permission',
        'Camera permission is required to scan QR codes.',
      );
    }
  };

  return (
    <View style={styles.container}>
      {isScannerOpen && device ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isScannerOpen}
            codeScanner={codeScanner}
          />
          <TouchableOpacity
            style={styles.closeScannerButton}
            onPress={() => setIsScannerOpen(false)}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Add New Recipient</Text>
          <TextInput
            label="Recipient Name"
            value={recipientName}
            onChangeText={setRecipientName}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.walletAddressContainer}>
            <TextInput
              label="Wallet Address"
              value={recipientWalletAddress}
              onChangeText={text => {
                setRecipientWalletAddress(text);
                setError('');
              }}
              style={[styles.input, styles.walletAddressInput]}
              mode="outlined"
              error={
                !isValidWalletAddress(recipientWalletAddress) &&
                recipientWalletAddress !== ''
              }
            />
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Ionicons name="qr-code-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {!isValidWalletAddress(recipientWalletAddress) &&
            recipientWalletAddress !== '' && (
              <Text style={styles.errorText}>
                Invalid wallet address format
              </Text>
            )}
          <TextInput
            label="Wallet Name"
            value={recipientWalletName}
            onChangeText={setRecipientWalletName}
            style={styles.input}
            mode="outlined"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleAddRecipient}
            loading={isLoading}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
            color="#007AFF">
            Add Recipient
          </Button>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 25,
    marginTop: 30,
    marginBottom: 25,
    color: '#333',
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletAddressInput: {
    flex: 1,
    marginRight: 8,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginTop: 25,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeScannerButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
});

export default AddRecipientScreen;
