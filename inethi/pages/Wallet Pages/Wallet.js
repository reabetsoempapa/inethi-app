import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  IconButton,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useBalance} from '../../context/BalanceContext';
import {
  checkWalletOwnership,
  fetchWalletDetails,
  trackButtonClick,
} from '../../service/Wallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalletCategoriesPage = () => {
  const navigation = useNavigation();
  const {balance, fetchBalance} = useBalance();
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const initializeComponent = useCallback(async () => {
    await handleCheckWalletOwnership();
    await fetchBalance();
    await handleCheckWalletDetails();
    await fetchTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      initializeComponent();
    }, [initializeComponent]),
  );

  const handleCheckWalletOwnership = async () => {
    try {
      const response = await checkWalletOwnership();
      setHasWallet(response.data.has_wallet);
    } catch (error) {
      console.error('Error checking wallet ownership:', error);
    }
  };

  const handleCheckWalletDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWalletDetails();
      setWalletAddress(response.data.wallet_address);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const storedTransactions =
        JSON.parse(await AsyncStorage.getItem('transactions')) || [];
      const sortedTransactions = storedTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setTransactions(sortedTransactions.slice(0, 3)); // Get only the 3 most recent transactions
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const walletCategories = [
    {
      name: 'Create Wallet',
      action: () => navigation.navigate('CreateWallet'),
      disabled: hasWallet,
      icon: 'wallet-plus-outline',
    },
    {
      name: 'Wallet Details',
      action: () => navigation.navigate('WalletDetails', {walletAddress}),
      requiresWallet: true,
      icon: 'wallet-outline',
    },
    {
      name: 'Transfer',
      action: async () => {
        await trackButtonClick('transfer_button_clicked');
        navigation.navigate('Payment');
      },
      requiresWallet: true,
      icon: 'swap-horizontal',
    },
    {
      name: 'Add Recipients',
      action: async () => {
        await trackButtonClick('add_recipients_button_clicked');
        navigation.navigate('AddRecipient');
      },
      requiresWallet: true,
      icon: 'account-plus-outline',
    },
    {
      name: 'View Recipients',
      action: async () => {
        await trackButtonClick('view_recipients_button_clicked');
        navigation.navigate('Recipients');
      },
      requiresWallet: true,
      icon: 'account-multiple-outline',
    },
    {
      name: 'Pay',
      action: () => navigation.navigate('Recipients', {state: {fromPay: true}}),
      requiresWallet: true,
      icon: 'cash',
    },
    {
      name: 'History',
      action: () => navigation.navigate('PaymentHistory'),
      requiresWallet: true,
      icon: 'history',
    },
  ];

  const renderCategoryItem = ({item}) => {
    const isDisabled =
      (item.name === 'Create Wallet' && hasWallet) ||
      (item.requiresWallet && !hasWallet) ||
      item.disabled;

    return (
      <Card
        onPress={isDisabled ? null : item.action}
        style={[styles.card, isDisabled && styles.disabledCard]}>
        <Card.Content style={styles.cardContent}>
          <IconButton
            icon={item.icon}
            size={40}
            color={isDisabled ? theme.colors.disabled : theme.colors.primary}
          />
          <Paragraph
            style={[
              styles.buttonLabel,
              {color: isDisabled ? theme.colors.disabled : theme.colors.text},
            ]}>
            {item.name}
          </Paragraph>
          {isDisabled && (
            <View style={styles.disabledOverlay}>
              <IconButton icon="lock" size={20} color={theme.colors.disabled} />
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderTransactionItem = ({item}) => (
    <View style={styles.transactionItem}>
      <Text>To: {item.recipient_address}</Text>
      <Text>Amount: {item.amount}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Date: {new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  const renderItem = ({item, index}) => {
    if (index === 0) {
      return (
        <View style={styles.balanceContainer}>
          {/* <Text style={styles.balanceLabel}>Balance</Text> */}
          <Text style={styles.balanceAmount}>{balance} Krone</Text>
          <Text style={styles.walletAddress}>{walletAddress}</Text>
        </View>
      );
    } else if (index === 1) {
      return (
        <View style={styles.categoriesContainer}>
          <FlatList
            key={`grid-${walletCategories.length}`}
            data={walletCategories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.name}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.buttonContainer}
          />
        </View>
      );
    } else if (index === 2) {
      return (
        <View style={styles.recentTransactionsContainer}>
          <Title style={styles.recentTransactionsTitle}>
            Recent Transactions
          </Title>
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      style={styles.container}
      data={[{id: 'balance'}, {id: 'categories'}, {id: 'transactions'}]}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListFooterComponent={() =>
        isLoading && (
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  balanceContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#000',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#000',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  walletAddress: {
    color: '#666',
    fontSize: 12,
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    marginBottom: 20,
    backgroundColor: 'white',
  },
  disabledCard: {
    backgroundColor: '#f0f0f0',
    elevation: 0,
  },
  cardContent: {
    alignItems: 'center',
    position: 'relative',
  },
  buttonLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  recentTransactionsContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  recentTransactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    padding: 10,
    marginVertical: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
});

export default WalletCategoriesPage;
