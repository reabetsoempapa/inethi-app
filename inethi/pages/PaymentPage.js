import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Dialog} from 'react-native-paper';
import {useBalance} from '../context/BalanceContext';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PaymentPage = () => {
  const {balance, fetchBalance, updateBalance} = useBalance();
  const navigation = useNavigation();
  const route = useRoute();
  const {recipient} = route.params || {}; // Get recipient from params, if available

  const [paymentMethod, setPaymentMethod] = useState('walletAddress');
  const [receiver, setReceiver] = useState(recipient?.wallet_address || '');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        setReceiver(codes[0].value);
        setIsScannerOpen(false);
      }
    },
  });

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

  const handleSendPayment = async () => {
    if (!receiver || !amount) {
      setError('Both fields are required');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      const errorMsg =
        'Insufficient funds. Please check your balance and try again.';
      setError(errorMsg);
      navigation.navigate('PaymentUnsuccessful', {errorMessage: errorMsg});
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const paymentData = {
        payment_method: paymentMethod,
        recipient_address: receiver,
        amount,
      };

      // Mocked send payment function, replace with actual API call
      const transaction = await mockSendPayment(paymentData);

      // Example of using the transaction result
      if (transaction.success) {
        setIsLoading(false);
        updateBalance(balance - parseFloat(amount));
        navigation.navigate('PaymentSuccess');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.message || 'Failed to send payment. Please try again later.';
      setError(errorMsg);
      navigation.navigate('PaymentUnsuccessful', {errorMessage: errorMsg});
    }
  };

  useEffect(() => {
    // Update balance to R500 for testing purposes
    updateBalance(500);

    // Fetch balance from API or mock
    fetchBalance();
  }, []);

  useEffect(() => {
    setIsButtonDisabled(!(receiver && amount));
  }, [receiver, amount]);

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
        <>
          <Picker
            selectedValue={paymentMethod}
            style={styles.picker}
            onValueChange={itemValue => setPaymentMethod(itemValue)}>
            <Picker.Item label="Username" value="username" />
            <Picker.Item label="Wallet Address" value="walletAddress" />
          </Picker>
          {paymentMethod === 'walletAddress' && (
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Ionicons name="qr-code-outline" size={24} color="white" />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          )}
          <View style={styles.inputContainer}>
            <Ionicons
              name={
                paymentMethod === 'username'
                  ? 'person-outline'
                  : 'wallet-outline'
              }
              size={20}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              onChangeText={setReceiver}
              value={receiver}
              placeholder={
                paymentMethod === 'username'
                  ? 'Username of receiver'
                  : 'Wallet address'
              }
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setAmount}
              value={amount}
              placeholder="Amount"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isButtonDisabled && styles.disabledButton,
            ]}
            onPress={handleSendPayment}
            disabled={isButtonDisabled}>
            <Text style={styles.buttonText}>Send Payment</Text>
          </TouchableOpacity>
          {isLoading && (
            <Dialog visible={true}>
              <Dialog.Content>
                <ActivityIndicator size="large" />
              </Dialog.Content>
            </Dialog>
          )}
        </>
      )}
    </View>
  );
};

const mockSendPayment = async paymentData => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({success: true}); // Mocking a successful payment
    }, 1000);
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 40,
    paddingRight: 10,
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1, // Add a border to make the picker stand out
    borderColor: '#0066ff', // Use the primary color for the border
    borderRadius: 8, // Match the border radius with other inputs
    backgroundColor: '#f0f0f0', // Light background to make it distinct
    paddingLeft: 10, // Add some padding
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  backButton: {
    backgroundColor: '#0066ff',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentPage;
