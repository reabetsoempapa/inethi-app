import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {
  TextInput,
  Button,
  Dialog,
  Portal,
  Paragraph,
  useTheme,
  IconButton,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useBalance} from '../../context/BalanceContext';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isValidWalletAddress} from './Helpers/WalletAdressValidator';

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
    setIsButtonDisabled(
      !(
        receiver &&
        amount &&
        (paymentMethod === 'username' || isValidWalletAddress(receiver))
      ),
    );
  }, [receiver, amount, paymentMethod]);

  const handleSendPayment = () => {
    if (!receiver || !amount) {
      setError('Both fields are required');
      return;
    }

    if (paymentMethod === 'walletAddress' && !isValidWalletAddress(receiver)) {
      setError('Invalid wallet address format');
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
    setError('');
    setIsPinModalVisible(true);
  };
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

  const theme = useTheme();

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
          <Button
            mode="contained"
            onPress={() => setIsScannerOpen(false)}
            style={styles.exitScannerButton}>
            Exit Scanner
          </Button>
        </>
      ) : (
        <View style={styles.formContainer}>
          <Picker
            selectedValue={paymentMethod}
            style={styles.picker}
            onValueChange={itemValue => setPaymentMethod(itemValue)}>
            <Picker.Item label="Username" value="username" />
            <Picker.Item label="Wallet Address" value="walletAddress" />
          </Picker>
          {paymentMethod === 'walletAddress' && (
            <Button
              mode="contained"
              onPress={openScanner}
              icon={({size, color}) => (
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={size}
                  color={color}
                />
              )}
              style={styles.scanButton}>
              Scan QR Code
            </Button>
          )}
          <TextInput
            label={
              paymentMethod === 'username'
                ? 'Username of receiver'
                : 'Wallet address'
            }
            value={receiver}
            onChangeText={text => {
              setReceiver(text);
              setError(''); // Clear error when input changes
            }}
            style={styles.input}
            left={
              <TextInput.Icon
                icon={({size, color}) => (
                  <MaterialCommunityIcons
                    name={paymentMethod === 'username' ? 'account' : 'wallet'}
                    size={size}
                    color={color}
                  />
                )}
              />
            }
            error={
              paymentMethod === 'walletAddress' &&
              !isValidWalletAddress(receiver) &&
              receiver !== ''
            }
          />
          {paymentMethod === 'walletAddress' &&
            !isValidWalletAddress(receiver) &&
            receiver !== '' && (
              <Paragraph style={styles.errorText}>
                Invalid wallet address format
              </Paragraph>
            )}
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            left={
              <TextInput.Icon
                icon={({size, color}) => (
                  <MaterialCommunityIcons
                    name="cash"
                    size={size}
                    color={color}
                  />
                )}
              />
            }
          />
          {error ? (
            <Paragraph style={styles.errorText}>{error}</Paragraph>
          ) : null}
          <Button
            mode="contained"
            onPress={handleSendPayment}
            disabled={isButtonDisabled}
            style={styles.sendButton}>
            Send Payment
          </Button>
        </View>
      )}
      <Portal>
        <Dialog
          visible={isPinModalVisible}
          onDismiss={() => setIsPinModalVisible(false)}>
          <Dialog.Title>Enter PIN</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="5-digit PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={5}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsPinModalVisible(false)}>Cancel</Button>
            <Button onPress={verifyPinAndProceed}>Verify</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  picker: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  scanButton: {
    marginBottom: 16,
  },
  sendButton: {
    marginTop: 16,
  },
  exitScannerButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});

export default PaymentPage;
