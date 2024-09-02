import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const storedTransactions =
          JSON.parse(await AsyncStorage.getItem('transactions')) || [];

        // Sort transactions by date (most recent first)
        const sortedTransactions = storedTransactions.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );

        setTransactions(sortedTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const renderItem = ({item}) => (
    <View style={styles.transactionItem}>
      <Text>To: {item.recipient_address}</Text>
      <Text>Amount: {item.amount}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Date: {new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyText}>No transactions found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  transactionItem: {
    padding: 10,
    marginVertical: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
    fontSize: 16,
  },
});

export default PaymentHistory;
