import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const storedTransactions =
          JSON.parse(await AsyncStorage.getItem('transactions')) || [];
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
    <View style={styles.card}>
      <Text style={styles.amountText}>{item.amount} Krone</Text>
      <View style={styles.infoRow}>
        <Icon name="account-arrow-right" size={20} color="#007AFF" />
        <Text style={styles.transactionText}>{item.recipient_address}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="calendar-clock" size={20} color="#007AFF" />
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
    padding: 16,
    backgroundColor: '#fff', // Light gray background for contrast with white cards
    paddingTop: 45,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#000',
    fontSize: 16,
  },
  downloadButton: {
    marginTop: 16,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  downloadButtonContent: {
    height: 50,
  },
  downloadButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentHistory;
