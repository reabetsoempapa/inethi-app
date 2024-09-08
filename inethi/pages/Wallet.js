import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import {IconButton, Dialog, Portal} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useBalance} from '../context/BalanceContext';
import {
  createWallet,
  checkWalletOwnership,
  fetchWalletDetails,
  trackButtonClick,
} from '../service/Wallet';

const WalletCategoriesPage = () => {
  const navigation = useNavigation();
  const {balance, fetchBalance} = useBalance();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleCheckWalletOwnership();
  }, []);

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
      setIsLoading(false);
      navigation.navigate('WalletDetails', {
        walletAddress: response.data.wallet_address,
      });
      await trackButtonClick('wallet_details_button_clicked');
    } catch (error) {
      setIsLoading(false);
      handleError(error, 'Failed to check wallet details');
    }
  };

  const handleShowQrCode = async () => {
    await handleCheckWalletDetails();
    setIsQrDialogOpen(true);
    await trackButtonClick('wallet_qr_code_button_clicked');
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
      action: _ => navigation.navigate('CreateWallet'),
      disabled: hasWallet,
      icon: 'wallet-plus-outline',
    },
    {
      name: 'Wallet Details',
      action: handleCheckWalletDetails,
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
        navigation.navigate('ViewRecipients');
      },
      icon: 'account-multiple-outline',
    },
    {
      name: 'Pay',
      action: () =>
        navigation.navigate('ViewRecipients', {state: {fromPay: true}}),
      icon: 'cash',
    },
    {
      name: 'History',
      action: () => navigation.navigate('PaymentHistory'),
      icon: 'history',
    },
  ];
  const renderButtons = buttons => {
    return (
      <View style={styles.buttonContainer}>
        {buttons.map(({name, action, requiresWallet, icon}, idx) => {
          const isDisabled = requiresWallet && !hasWallet;
          return (
            <View key={idx} style={styles.buttonWrapper}>
              <View style={styles.buttonBackground}>
                <IconButton
                  icon={icon}
                  size={40} // Icon size
                  color="#0066ff" // Icon color
                  style={styles.icon}
                  onPress={action}
                  disabled={isDisabled}
                />
                <Text style={styles.buttonLabel}>{name}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderButtons(walletCategories)}

        <Portal>
          {isLoading && (
            <Dialog visible={true}>
              <Dialog.Content>
                <ActivityIndicator size="large" />
              </Dialog.Content>
            </Dialog>
          )}
        </Portal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f5', // Very faint light blue background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start', // Start higher up on the page
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, // Start a bit higher up on the page
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Ensure spacing is equal on both sides
  },
  buttonWrapper: {
    width: '30%', // Ensures three buttons per row
    alignItems: 'center',
    marginBottom: 20, // Space between the rows
  },
  icon: {
    marginBottom: 8, // Space between the icon and the label
  },
  buttonLabel: {
    fontSize: 14, // Adjust label size
    color: '#333333', // Label color
    textAlign: 'center', // Center the label text
  },
  buttonBackground: {
    backgroundColor: '#ffffff', // Set to white
    borderRadius: 8, // Optional: add border radius for rounded corners
    padding: 20, // Adjust padding as needed
    width: 110, // Fixed width for all buttons
    height: 105, // Fixed height for all buttons
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
});

export default WalletCategoriesPage;
