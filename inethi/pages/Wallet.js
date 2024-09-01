import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Portal,
  IconButton,
  Paragraph,
  TextInput,
} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import axios from 'axios';
import {getToken} from '../utils/tokenUtils';
import {useBalance} from '../context/BalanceContext';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as amplitude from '@amplitude/analytics-react-native';
import analytics from '@react-native-firebase/analytics';
amplitude.init('d641bfb8c1944a8894e65cc64309318e');

const WalletCategoriesPage = () => {
  const baseURL = 'https://manage-backend.inethicloud.net';
  const walletCreateEndpoint = '/wallet/create/';
  const walletOwnershipEndpoint = '/wallet/ownership/';
  const walletDetailsEndpoint = '/wallet/details/';
  const navigate = useNavigate();
  const {balance, fetchBalance} = useBalance();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  const [hasWallet, setHasWallet] = useState(false);
  const [isCreateWalletDialogOpen, setIsCreateWalletDialogOpen] =
    useState(false);
  const [walletName, setWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletDetails, setWalletDetails] = useState(null);
  const [detailsError, setDetailsError] = useState('');
  const [isBalanceDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    checkWalletOwnership();
  }, []);

  const trackButtonClick = async (eventName, data = {}) => {
    const events =
      JSON.parse(await AsyncStorage.getItem('analyticsEvents')) || [];
    events.push({
      eventName,
      timestamp: new Date(),
      data,
    });
    await AsyncStorage.setItem('analyticsEvents', JSON.stringify(events));

    const state = await NetInfo.fetch();
    if (state.isConnected) {
      syncAnalyticsEvents();
    }
  };

  const syncAnalyticsEvents = async () => {
    try {
      const events =
        JSON.parse(await AsyncStorage.getItem('analyticsEvents')) || [];
      if (events.length > 0) {
        for (const event of events) {
          await analytics().logEvent(event.eventName, event.data);
          await amplitude.track(event.eventName, event.data);
        }
        await AsyncStorage.removeItem('analyticsEvents');
        console.log('Synced analytics events');
      }
    } catch (error) {
      console.error('Error syncing analytics events:', error);
    }
  };

  const handleCreateWalletClick = async () => {
    setIsCreateWalletDialogOpen(true);
    await trackButtonClick('create_wallet_button_clicked');
  };

  const fetchWalletDetails = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.get(
        `${baseURL}${walletDetailsEndpoint}`,
        config,
      );
      setWalletDetails(response.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Error', 'Authentication credentials were not provided.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'User does not exist.');
        } else if (error.response.status === 417) {
          Alert.alert('Error', 'User does not have a wallet.');
        } else if (error.response.status === 500) {
          Alert.alert(
            'Error',
            'Error checking wallet details. Please contact iNethi support.',
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to check wallet details: ${error.message}`,
          );
        }
      } else {
        Alert.alert(
          'Error',
          `Failed to check wallet details: ${error.message}`,
        );
      }
    }
  };

  const handleCreateWallet = async () => {
    try {
      const token = await getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(
        `${baseURL}${walletCreateEndpoint}`,
        {wallet_name: walletName},
        config,
      );
      setIsCreateWalletDialogOpen(false);
      if (response.status === 201) {
        setHasWallet(true);
        alert(
          `Wallet created successfully! Address: ${response.data.address}, Name: ${response.data.name}`,
        );
        fetchBalance();
        await trackButtonClick('wallet_created', {walletName: walletName});
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      setIsCreateWalletDialogOpen(false);
      if (error.response) {
        if (error.response.status === 400) {
          alert(
            'Cannot connect to the iNethi server. Please check your Internet connection.',
          );
        } else if (error.response.status === 401) {
          alert('Authentication credentials were not provided.');
        } else if (error.response.status === 403) {
          alert('You do not have permission to create a wallet.');
        } else if (error.response.status === 409) {
          alert('You already have a wallet.');
        } else if (error.response.status === 500) {
          alert('Error creating wallet. Please contact iNethi support.');
        } else {
          alert(`Failed to create wallet: ${error.message}`);
        }
      } else {
        alert(`Failed to create wallet: ${error.message}`);
      }
    }
  };

  const checkWalletOwnership = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.get(
        `${baseURL}${walletOwnershipEndpoint}`,
        config,
      );
      setHasWallet(response.data.has_wallet);
    } catch (error) {
      console.error('Error checking wallet ownership:', error);
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Error', 'Authentication credentials were not provided.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'User does not exist.');
        } else if (error.response.status === 500) {
          Alert.alert(
            'Error',
            'Error checking wallet ownership. Please contact iNethi support.',
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to check wallet ownership: ${error.message}`,
          );
        }
      } else {
        Alert.alert(
          'Error',
          `Failed to check wallet ownership: ${error.message}`,
        );
      }
    }
  };

  const handleCheckWalletDetails = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.get(
        `${baseURL}${walletDetailsEndpoint}`,
        config,
      );
      setWalletDetails(response.data);
      setIsLoading(false);
      navigate(`/wallet-details`, {
        state: {walletAddress: response.data.wallet_address},
      });
      await trackButtonClick('wallet_details_button_clicked');
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Error', 'Authentication credentials were not provided.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'User does not exist.');
        } else if (error.response.status === 417) {
          Alert.alert('Error', 'User does not have a wallet.');
        } else if (error.response.status === 500) {
          Alert.alert(
            'Error',
            'Error checking wallet details. Please contact iNethi support.',
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to check wallet details: ${error.message}`,
          );
        }
      } else {
        Alert.alert(
          'Error',
          `Failed to check wallet details: ${error.message}`,
        );
      }
    }
  };

  const handleShowQrCode = async () => {
    await fetchWalletDetails();
    setIsQrDialogOpen(true);
    await trackButtonClick('wallet_qr_code_button_clicked');
  };

  const walletCategories = [
    {
      name: 'Create Wallet',
      action: _ => navigate('/create-Wallet'),
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
        navigate('/payment');
      },
      requiresWallet: true,
      icon: 'swap-horizontal',
    },
    {
      name: 'Add Recipients',
      action: async () => {
        await trackButtonClick('add_recipients_button_clicked');
        navigate('/add-recipient');
      },
      requiresWallet: true,
      icon: 'account-plus-outline',
    },
    {
      name: 'View Recipients',
      action: async () => {
        await trackButtonClick('view_recipients_button_clicked');
        navigate('/view-recipients');
      },
      requiresWallet: true,
      icon: 'account-multiple-outline',
    },
    {
      name: 'Wallet QR Code',
      action: handleShowQrCode,
      requiresWallet: true,
      icon: 'qrcode-scan',
    },
    {
      name: 'Pay',
      action: () => navigate('/view-recipients', {state: {fromPay: true}}),
      requiresWallet: true,
      icon: 'cash',
    },
    {
      name: 'History',
      action: () => navigate('/payment-history'),
      requiresWallet: true,
      icon: 'history',
    },
  ];
  const renderButtons = buttons => {
    const buttonRows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      const pair = buttons.slice(i, i + 2);
      buttonRows.push(
        <View key={i} style={styles.buttonRow}>
          {pair.map(({name, action, requiresWallet, icon}, idx) => {
            const isDisabled = requiresWallet && !hasWallet;
            return (
              <Button
                key={idx}
                mode="contained"
                onPress={action}
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                contentStyle={styles.buttonContent}
                disabled={isDisabled}
                icon={() => (
                  <IconButton
                    icon={icon}
                    size={40}
                    color="white"
                    style={styles.icon}
                  />
                )}>
                {name}
              </Button>
            );
          })}
        </View>,
      );
    }
    return buttonRows;
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>{renderButtons(walletCategories)}</Card.Content>
        </Card>

        <Portal>
          <Dialog
            visible={isCreateWalletDialogOpen}
            onDismiss={() => setIsCreateWalletDialogOpen(false)}>
            <Dialog.Title>Create Wallet</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Please enter a name for your new wallet.</Paragraph>
              <TextInput
                label="Wallet Name"
                value={walletName}
                onChangeText={text => setWalletName(text)}
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsCreateWalletDialogOpen(false)}>
                Cancel
              </Button>
              <Button onPress={handleCreateWallet}>Create</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            visible={isQrDialogOpen}
            onDismiss={() => setIsQrDialogOpen(false)}>
            <Dialog.Title>Wallet QR Code</Dialog.Title>
            <Dialog.Content>
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : walletDetails ? (
                <View style={styles.qrCodeContainer}>
                  <QRCode value={walletDetails.wallet_address} size={200} />
                  <View style={styles.walletAddressContainer}>
                    <Paragraph style={styles.walletAddress}>
                      Wallet Address: {walletDetails.wallet_address}
                    </Paragraph>
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={() => {
                        Clipboard.setString(walletDetails.wallet_address);
                        Alert.alert(
                          'Copied',
                          'Wallet address copied to clipboard',
                        );
                      }}
                    />
                  </View>
                </View>
              ) : detailsError ? (
                <Paragraph>{detailsError}</Paragraph>
              ) : (
                <Paragraph>Failed to load wallet details.</Paragraph>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsQrDialogOpen(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            visible={isBalanceDialogOpen}
            onDismiss={() => setIsDetailDialogOpen(false)}>
            <Dialog.Title>Wallet Details</Dialog.Title>
            <Dialog.Content>
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : walletDetails ? (
                <>
                  <View style={styles.walletAddressContainer}>
                    <Paragraph style={styles.walletAddress}>
                      Wallet Address: {walletDetails.wallet_address}
                    </Paragraph>
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={() => {
                        Clipboard.setString(walletDetails.wallet_address);
                        Alert.alert(
                          'Copied',
                          'Wallet address copied to clipboard',
                        );
                      }}
                    />
                  </View>
                  <Paragraph>Balance: {walletDetails.balance}</Paragraph>
                </>
              ) : detailsError ? (
                <Paragraph>{detailsError}</Paragraph>
              ) : (
                <Paragraph>Failed to load wallet details.</Paragraph>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </Dialog.Actions>
          </Dialog>

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
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#0066ff',
    height: 100,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
  },
  buttonContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    margin: 0,
  },
  backButton: {
    backgroundColor: '#0066ff',
    marginTop: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  walletAddress: {
    flex: 1,
    fontSize: 14,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default WalletCategoriesPage;
