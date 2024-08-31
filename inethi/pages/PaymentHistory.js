import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const storedTransactions =
        JSON.parse(await AsyncStorage.getItem('transactions')) || [];
      setTransactions(storedTransactions);
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
    <FlatList
      data={transactions}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    padding: 10,
    marginVertical: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default PaymentHistory;
