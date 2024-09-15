import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetupPIN = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const navigation = useNavigation();

  const handleSetupPIN = async () => {
    if (pin.length !== 5 || confirmPin.length !== 5) {
      Alert.alert('Error', 'PIN must be 5 digits long');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await AsyncStorage.setItem('@wallet_pin', pin);
      Alert.alert('Success', 'PIN set successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup PIN</Text>
      <Text style={styles.description}>
        Please enter a 5-digit PIN to secure your wallet.
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={setPin}
        value={pin}
        placeholder="Enter PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={5}
      />
      <TextInput
        style={styles.input}
        onChangeText={setConfirmPin}
        value={confirmPin}
        placeholder="Confirm PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={5}
      />
      <TouchableOpacity style={styles.button} onPress={handleSetupPIN}>
        <Text style={styles.buttonText}>Set PIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SetupPIN;
