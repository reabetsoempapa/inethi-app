import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Card, Text} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecipientDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {recipient} = route.params;

  const handlePay = () => {
    navigation.navigate('Payment', {recipient: recipient});
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recipient Details</Text>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={24} color="#007AFF" />
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{recipient.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={24} color="#007AFF" />
            <Text style={styles.detailLabel}>Wallet Address:</Text>
            <Text
              style={styles.detailValue}
              numberOfLines={1}
              ellipsizeMode="middle">
              {recipient.wallet_address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="logo-bitcoin" size={24} color="#007AFF" />
            <Text style={styles.detailLabel}>Wallet Name:</Text>
            <Text style={styles.detailValue}>{recipient.wallet_name}</Text>
          </View>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handlePay}
          style={styles.payButton}
          labelStyle={styles.buttonLabel}
          color="#007AFF">
          Pay
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
    marginVertical: 16,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#555',
    flex: 1,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  buttonContainer: {
    margin: 16,
  },
  payButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipientDetailsScreen;
