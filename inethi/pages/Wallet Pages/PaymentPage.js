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
import {Dialog, Portal} from 'react-native-paper';
import {useBalance} from '../../context/BalanceContext';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentPage = () => {
  const {balance, fetchBalance, updateBalance} = useBalance();
  const navigation = useNavigation();
  const route = useRoute();
  const {recipient} = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('walletAddress');
  const [receiver, setReceiver] = useState(recipient?.wallet_address || '');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isPinSet, setIsPinSet] = useState(false);

  useEffect(() => {
    checkPinStatus();
    updateBalance(500);
    fetchBalance();
  }, []);

  useEffect(() => {
    setIsButtonDisabled(!(receiver && amount));
  }, [receiver, amount]);
  const checkPinStatus = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('@wallet_pin');
      console.log(
        'Checking PIN status:',
        storedPin ? 'PIN exists' : 'No PIN set',
      );
      setIsPinSet(!!storedPin);
    } catch (error) {
      console.error('Error checking PIN status:', error);
      Alert.alert('Error', 'Failed to check PIN status. Please try again.');
    }
  };

  const handleSendPayment = () => {
    if (!receiver || !amount) {
      setError('Both fields are required');
      return;
    }

    if (!isPinSet) {
      Alert.alert(
        'PIN Not Set',
        'Please set up a PIN before making a payment.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SetupPIN'),
          },
        ],
      );
      return;
    }

    // Clear any previous errors and open the PIN modal
    setError('');
    setIsPinModalVisible(true);
  };

  const verifyPinAndProceed = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('@wallet_pin');
      console.log('Verifying PIN:', storedPin ? 'PIN exists' : 'No PIN set');
      if (!storedPin) {
        Alert.alert('Error', 'PIN not set. Please set up a PIN first.');
        setIsPinModalVisible(false);
        navigation.navigate('SetupPIN');
        return;
      }

      if (pin === storedPin) {
        setIsPinModalVisible(false);
        setPin(''); // Clear the PIN input
        checkBalanceAndProceed(); // Check balance after PIN verification
      } else {
        Alert.alert('Error', 'Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('Error retrieving PIN:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    }
  };

  const checkBalanceAndProceed = () => {
    if (parseFloat(amount) > parseFloat(balance)) {
      const errorMsg =
        'Insufficient funds. Please check your balance and try again.';
      setError(errorMsg);
      navigation.navigate('PaymentUnsuccessful', {errorMessage: errorMsg});
    } else {
      proceedWithPayment();
    }
  };

  const proceedWithPayment = async () => {
    setIsLoading(true);

    try {
      const paymentData = {
        payment_method: paymentMethod,
        recipient_address: receiver,
        amount,
      };

      // Mocked send payment function, replace with actual API call
      const transaction = await mockSendPayment(paymentData);

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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
      <Portal>
        <Dialog
          visible={isPinModalVisible}
          onDismiss={() => {
            setIsPinModalVisible(false);
            setPin(''); // Clear the PIN input when dismissing
          }}>
          <Dialog.Title>Enter PIN</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.pinInput}
              onChangeText={setPin}
              value={pin}
              placeholder="Enter your 5-digit PIN"
              keyboardType="numeric"
              secureTextEntry
              maxLength={5}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity
              onPress={() => {
                setIsPinModalVisible(false);
                setPin(''); // Clear the PIN input when cancelling
              }}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={verifyPinAndProceed}>
              <Text style={styles.dialogButton}>Verify</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    borderWidth: 1,
    borderColor: '#0066ff',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingLeft: 10,
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
  pinInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dialogButton: {
    color: '#0066ff',
    marginLeft: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default PaymentPage;
