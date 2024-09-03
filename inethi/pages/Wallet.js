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
      name: 'Wallet QR Code',
      action: handleShowQrCode,
      icon: 'qrcode-scan',
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

  // const renderButtons = buttons => {
  //   return (
  //     <View style={styles.buttonContainer}>
  //       {buttons.map(({name, action, icon}, idx) => (
  //         <View key={idx} style={styles.buttonWrapper}>
  //           <IconButton
  //             icon={icon}
  //             size={30} // Adjust icon size
  //             color="#0066ff" // Icon color
  //             style={styles.icon}
  //             onPress={action}
  //           />
  //           <Text style={styles.buttonLabel}>{name}</Text>
  //         </View>
  //       ))}
  //     </View>
  //   );
  // };
  const renderButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="wallet-plus-outline"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={() => navigation.navigate('CreateWallet')}
            />
            <Text style={styles.buttonLabel}>Create Wallet</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="wallet-outline"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={handleCheckWalletDetails}
            />
            <Text style={styles.buttonLabel}>Wallet Details</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="swap-horizontal"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={async () => {
                await trackButtonClick('transfer_button_clicked');
                navigation.navigate('Payment');
              }}
            />
            <Text style={styles.buttonLabel}>Transfer</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="account-plus-outline"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={async () => {
                await trackButtonClick('add_recipients_button_clicked');
                navigation.navigate('AddRecipient');
              }}
            />
            <Text style={styles.buttonLabel}>Add Recipients</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="account-multiple-outline"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={async () => {
                await trackButtonClick('view_recipients_button_clicked');
                navigation.navigate('ViewRecipients');
              }}
            />
            <Text style={styles.buttonLabel}>View Recipients</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="qrcode-scan"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={handleShowQrCode}
            />
            <Text style={styles.buttonLabel}>Wallet QR Code</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="cash"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={() =>
                navigation.navigate('ViewRecipients', {state: {fromPay: true}})
              }
            />
            <Text style={styles.buttonLabel}>Pay</Text>
          </View>
          <View style={styles.buttonWrapper}>
            <IconButton
              icon="history"
              size={30}
              color="#0066ff"
              style={styles.icon}
              onPress={() => navigation.navigate('PaymentHistory')}
            />
            <Text style={styles.buttonLabel}>History</Text>
          </View>
        </View>
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
    backgroundColor: '#e8e9eb',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '30%',
  },
  icon: {
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
});

export default WalletCategoriesPage;
