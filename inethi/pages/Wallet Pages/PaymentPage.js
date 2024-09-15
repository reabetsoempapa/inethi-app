import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {
  TextInput,
  Button,
  Dialog,
  Portal,
  Paragraph,
  useTheme,
  IconButton,
  Modal,
  Text,
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
  const theme = useTheme();

  useEffect(() => {
    checkPinStatus();
    fetchBalance();
  }, []);

  useEffect(() => {
    setIsButtonDisabled(
      !(
        receiver &&
        amount &&
        (paymentMethod === 'username' || isValidWalletAddress(receiver))
      ),
    );
  }, [receiver, amount, paymentMethod]);

  const checkPinStatus = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('@wallet_pin');
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

  const verifyPinAndProceed = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('@wallet_pin');
      if (!storedPin) {
        Alert.alert('Error', 'PIN not set. Please set up a PIN first.');
        setIsPinModalVisible(false);
        navigation.navigate('SetupPIN');
        return;
      }

      if (pin === storedPin) {
        setIsPinModalVisible(false);
        setPin('');
        checkBalanceAndProceed();
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
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isScannerOpen}
            codeScanner={codeScanner}
          />
          <Button
            mode="contained"
            onPress={() => setIsScannerOpen(false)}
            style={styles.exitScannerButton}
            color="#007AFF">
            Exit Scanner
          </Button>
        </>
      ) : (
        <View style={styles.formContainer}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{balance} Krone</Text>
          </View>
          <Picker
            selectedValue={paymentMethod}
            style={styles.picker}
            onValueChange={itemValue => setPaymentMethod(itemValue)}>
            <Picker.Item label="Username" value="username" />
            <Picker.Item label="Wallet Address" value="walletAddress" />
          </Picker>
          {paymentMethod === 'walletAddress' && (
            <Button
              mode="outlined"
              onPress={openScanner}
              icon={({size, color}) => (
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={size}
                  color="#007AFF"
                />
              )}
              style={styles.scanButton}
              color="#007AFF">
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
              setError('');
            }}
            style={styles.input}
            left={
              <TextInput.Icon
                icon={({size, color}) => (
                  <MaterialCommunityIcons
                    name={paymentMethod === 'username' ? 'account' : 'wallet'}
                    size={size}
                    color="#007AFF"
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
              <Text style={styles.errorText}>
                Invalid wallet address format
              </Text>
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
                    color="#007AFF"
                  />
                )}
              />
            }
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleSendPayment}
            style={styles.sendButton}
            labelStyle={styles.sendButtonLabel}
            loading={isLoading}
            color="#007AFF">
            Send Payment
          </Button>
        </View>
      )}
      <Portal>
        <Modal
          visible={isPinModalVisible}
          onDismiss={() => setIsPinModalVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <TextInput
              label="5-digit PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={5}
              style={styles.modalInput}
            />
            <View style={styles.modalButtonContainer}>
              <Button
                onPress={() => setIsPinModalVisible(false)}
                color="#007AFF"
                style={styles.modalButton}>
                Cancel
              </Button>
              <Button
                onPress={verifyPinAndProceed}
                color="#007AFF"
                style={styles.modalButton}>
                Verify
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  picker: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  scanButton: {
    marginBottom: 16,
    borderColor: '#007AFF',
  },
  sendButton: {
    marginTop: 10,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitScannerButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PaymentPage;
