import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {TextInput, Button, Portal, Modal, Text} from 'react-native-paper';
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
import {sendPayment, trackButtonClick} from '../../service/Wallet';

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
        recipient_alias: paymentMethod === 'username' ? receiver : undefined,
        recipient_address:
          paymentMethod === 'walletAddress' ? receiver : undefined,
        amount,
      };

      const response = await sendPayment(paymentData);

      if (response.data.success) {
        setIsLoading(false);
        updateBalance(balance - parseFloat(amount));
        trackButtonClick('Payment_Sent', {amount, paymentMethod});

        // Store the successful transaction in AsyncStorage
        await storeTransaction({
          id: Date.now(), // Using timestamp as a simple unique identifier
          recipient_address: receiver,
          amount,
          status: 'Success',
          date: new Date().toISOString(),
        });

        navigation.navigate('PaymentSuccess');
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to send payment. Please try again later.';
      setError(errorMsg);
      trackButtonClick('Payment_Failed', {
        amount,
        paymentMethod,
        error: errorMsg,
      });
      navigation.navigate('PaymentUnsuccessful', {errorMessage: errorMsg});
    }
  };

  const storeTransaction = async transaction => {
    try {
      const existingTransactions =
        JSON.parse(await AsyncStorage.getItem('transactions')) || [];
      const updatedTransactions = [...existingTransactions, transaction];
      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(updatedTransactions),
      );
    } catch (error) {
      console.error('Failed to store transaction:', error);
      // Consider showing an alert to the user
      Alert.alert(
        'Warning',
        'Failed to save transaction history. The payment was successful, but it may not appear in your history.',
      );
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
            contentStyle={styles.sendButtonContent}
            loading={isLoading}
            disabled={isButtonDisabled}
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
    paddingTop: 35,
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
    color: 'black',
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
    color: 'white',
  },
  sendButtonContent: {
    height: 50,
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
