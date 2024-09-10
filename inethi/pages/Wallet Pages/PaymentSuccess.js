import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const PaymentSuccess = () => {
  const navigation = useNavigation(); // Updated to use useNavigation

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="green" />
      <Text style={styles.successText}>Payment Successful!</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 20,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#0066ff',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccess;
