import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, StyleSheet, Text, FlatList, Alert} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  IconButton,
  ActivityIndicator,
  useTheme,
  Button,
} from 'react-native-paper';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {useBalance} from '../../context/BalanceContext';
import {
  checkWalletOwnership,
  fetchWalletDetails,
  trackButtonClick,
} from '../../service/Wallet';
import {CopilotStep, walkthroughable, useCopilot} from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalkthroughableView = walkthroughable(View);

const WalletCategoriesPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {balance, fetchBalance} = useBalance();
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const tutorialStartedRef = useRef(false);

  const {start, copilotEvents, stop} = useCopilot();
  const theme = useTheme();

  useEffect(() => {
    const handleStepChange = step => {
      console.log('Tutorial step changed:', step);
    };

    const handleStop = () => {
      stop();
      console.log('Tutorial finished');
      navigation.setParams({startTutorial: null});
      tutorialStartedRef.current = false;
      setIsTutorialStarted(false);
      navigation.navigate('HomeScreen');
    };

    copilotEvents.on('stepChange', handleStepChange);
    copilotEvents.on('stop', handleStop);

    return () => {
      copilotEvents.off('stepChange', handleStepChange);
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents, navigation]);

  const startTutorialIfNeeded = useCallback(() => {
    if (route.params?.startTutorial && !tutorialStartedRef.current) {
      console.log('Attempting to start tutorial');
      setTimeout(() => {
        try {
          start();
          console.log('Tutorial started successfully');
          tutorialStartedRef.current = true;
          setIsTutorialStarted(true);
        } catch (error) {
          console.error('Error starting tutorial:', error);
        }
      }, 500);
    } else {
      console.log('Tutorial already started or flag not set');
    }
  }, [route.params, start]);

  const initializeComponent = useCallback(async () => {
    await handleCheckWalletOwnership();
    await fetchBalance();
    await handleCheckWalletDetails();
    await fetchTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      initializeComponent();
      console.log('Screen focused, checking if tutorial should start');
      startTutorialIfNeeded();
    }, [initializeComponent, startTutorialIfNeeded]),
  );

  const handleCheckWalletOwnership = async () => {
    try {
      const response = await checkWalletOwnership();
      setHasWallet(response.data.has_wallet);
    } catch (error) {
      console.error('Error checking wallet ownership:', error);
      handleError(error, 'Failed to check wallet ownership');
    }
  };

  const handleCheckWalletDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWalletDetails();
      setWalletAddress(response.data.wallet_address);
    } catch (error) {
      handleError(error, 'Failed to check wallet details');
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
      setTransactions(sortedTransactions.slice(0, 3));
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleError = (error, defaultMessage) => {
    if (error.response) {
      const {status, message} = error.response;
      switch (status) {
        case 401:
          Alert.alert('Error', 'Authentication credentials were not provided.');
          break;
        case 404:
          Alert.alert('Error', 'User does not exist.');
          break;
        case 417:
          Alert.alert('Error', 'User does not have a wallet.');
          break;
        case 500:
          Alert.alert('Error', 'Server error. Please contact support.');
          break;
        default:
          Alert.alert('Error', `${defaultMessage}: ${message}`);
      }
    } else {
      Alert.alert('Error', `${defaultMessage}: ${error.message}`);
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

  const renderCategoryItem = ({item, index}) => {
    const isDisabled =
      (item.name === 'Create Wallet' && hasWallet) ||
      (item.requiresWallet && !hasWallet) ||
      item.disabled;

    return (
      <CopilotStep
        text={`This is the ${
          item.name
        } button. You can use it to ${item.name.toLowerCase()}.`}
        order={index + 1}
        name={`wallet_step_${index + 1}`}>
        <WalkthroughableView style={styles.buttonWrapper}>
          <Card
            onPress={isDisabled ? null : item.action}
            style={[styles.card, isDisabled && styles.disabledCard]}>
            <Card.Content style={styles.cardContent}>
              <IconButton
                icon={item.icon}
                size={40}
                color={isDisabled ? theme.colors.disabled : '#007AFF'}
              />
              <Paragraph
                style={[
                  styles.buttonLabel,
                  {color: isDisabled ? theme.colors.disabled : '#000000'},
                ]}>
                {item.name}
              </Paragraph>
              {isDisabled && (
                <View style={styles.disabledOverlay}>
                  <IconButton
                    icon="lock"
                    size={20}
                    color={theme.colors.disabled}
                  />
                </View>
              )}
            </Card.Content>
          </Card>
        </WalkthroughableView>
      </CopilotStep>
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
          {/* <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>{balance} Krone</Text>
          <Text style={styles.walletAddress}>{walletAddress}</Text> */}
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
  buttonWrapper: {
    width: '30%',
    marginBottom: 20,
  },
  card: {
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
  downloadButton: {
    marginTop: 10,
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

export default WalletCategoriesPage;
