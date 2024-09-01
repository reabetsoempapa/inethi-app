// pages/PaymentPage.js
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
import {useNavigate, useLocation} from 'react-router-native';
import {Dialog} from 'react-native-paper';
import {useBalance} from '../context/BalanceContext';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const PaymentPage = () => {
  const {balance, fetchBalance, updateBalance} = useBalance();
  const device = useCameraDevice('back');
  const navigate = useNavigate();
  const {state} = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('walletAddress');
  const [receiver, setReceiver] = useState(
    state?.recipient?.wallet_address || '',
  );
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
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
      navigate('/payment-unsuccessful', {state: {errorMessage: errorMsg}});
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

      const transaction = await mockSendPayment(paymentData);
      setIsLoading(false);
      updateBalance(balance - amount);
      navigate('/payment-success');
    } catch (error) {
      setIsLoading(false);
      const errorMsg = 'Failed to send payment. Please try again later.';
      setError(errorMsg);
      navigate('/payment-unsuccessful', {state: {errorMessage: errorMsg}});
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (receiver && amount) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [receiver, amount]);

  return (
    <View style={styles.container}>
      <Header title="Make a Payment" />
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
          <View style={styles.formContainer}>
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
              <Ionicons
                name="cash-outline"
                size={20}
                style={styles.inputIcon}
              />
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
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate(-1)}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
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
