import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import {Button, TextInput, Paragraph} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import {addRecipient} from '../service/recipient';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddRecipientScreen = () => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [recipientWalletName, setRecipientWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

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
            style={{flex: 1, width: '100%'}}
            device={device}
            isActive={isScannerOpen}
            codeScanner={codeScanner}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsScannerOpen(false)}>
            <Text style={styles.buttonText}>Exit Scanner</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <TextInput
            label="Recipient Name"
            value={recipientName}
            onChangeText={text => setRecipientName(text)}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.inputWithButton}>
            <TextInput
              label="Recipient Wallet Address"
              value={recipientWalletAddress}
              onChangeText={text => setRecipientWalletAddress(text)}
              style={[styles.input, styles.inputWithButtonTextInput]}
              mode="outlined"
            />
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Ionicons name="qr-code-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
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
      )}
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
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputWithButtonTextInput: {
    flex: 1,
    marginRight: 8,
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
    alignItems: 'center',
  },
  scanButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddRecipientScreen;
