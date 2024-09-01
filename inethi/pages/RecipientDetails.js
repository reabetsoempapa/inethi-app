import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigate, useLocation} from 'react-router-native';
import {Button} from 'react-native-paper';

const RecipientDetailsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {recipient} = location.state;

  const handlePay = () => {
    navigate('/payment', {state: {walletAddress: recipient.wallet_address}});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipient Details</Text>
      <Text style={styles.detail}>Name: {recipient.name}</Text>
      <Text style={styles.detail}>
        Wallet Address: {recipient.wallet_address}
      </Text>
      <Text style={styles.detail}>Wallet Name: {recipient.wallet_name}</Text>
      <Button mode="contained" onPress={handlePay} style={styles.button}>
        Pay
      </Button>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  detail: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    marginTop: 20,
    width: '80%',
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButton: {
    marginTop: 10,
    borderColor: '#0066ff',
  },
});

export default RecipientDetailsScreen;
