import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Card, Title, Paragraph, Text} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecipientDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {recipient} = route.params;

  const handlePay = () => {
    navigation.navigate('Payment', {walletAddress: recipient.wallet_address});
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Recipient Details</Title>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={24} color="#0066ff" />
            <Paragraph style={styles.detail}>Name: {recipient.name}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={24} color="#0066ff" />
            <Paragraph style={styles.detail}>
              Wallet Address: {recipient.wallet_address}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="logo-bitcoin" size={24} color="#0066ff" />
            <Paragraph style={styles.detail}>
              Wallet Name: {recipient.wallet_name}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handlePay} style={styles.payButton}>
          Pay
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detail: {
    fontSize: 16,
    marginLeft: 12,
    color: '#555',
    flex: 1,
  },
  buttonContainer: {
    margin: 16,
  },
  payButton: {
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#0066ff',
  },
  backButton: {
    paddingVertical: 8,
    borderColor: '#0066ff',
  },
});

export default RecipientDetailsScreen;
