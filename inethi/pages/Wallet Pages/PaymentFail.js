import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';

const PaymentUnsuccessful = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {errorMessage} = route.params || {}; // Get the error message passed from the Payment page

  return (
    <View style={styles.container}>
      <Ionicons name="close-circle" size={100} color="red" />
      <Text style={styles.errorText}>Payment Unsuccessful</Text>
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
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
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
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

export default PaymentUnsuccessful;
