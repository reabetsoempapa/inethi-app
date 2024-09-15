import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  IconButton,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  useTheme,
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

const WalkthroughableView = walkthroughable(View);

const WalletCategoriesPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {balance, fetchBalance} = useBalance();
  const [hasWallet, setHasWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const tutorialStartedRef = useRef(false);

  const {start, copilotEvents, stop} = useCopilot();
  const theme = useTheme();

  useEffect(() => {
    handleCheckWalletOwnership();
    setupTutorialListeners();
    return () => removeTutorialListeners();
  }, []);

  useFocusEffect(
    useCallback(() => {
      startTutorialIfNeeded();
    }, [route.params]),
  );

  const setupTutorialListeners = () => {
    copilotEvents.on('stepChange', step =>
      console.log('Tutorial step changed:', step),
    );
    copilotEvents.on('stop', handleTutorialStop);
  };

  const removeTutorialListeners = () => {
    copilotEvents.off('stepChange');
    copilotEvents.off('stop');
  };

  const handleTutorialStop = () => {
    stop();
    console.log('Tutorial finished');
    navigation.setParams({startTutorial: null});
    tutorialStartedRef.current = false;
    navigation.navigate('HomeScreen');
  };

  const startTutorialIfNeeded = () => {
    if (route.params?.startTutorial && !tutorialStartedRef.current) {
      console.log('Attempting to start tutorial');
      setTimeout(() => {
        try {
          start();
          console.log('Tutorial started successfully');
          tutorialStartedRef.current = true;
        } catch (error) {
          console.error('Error starting tutorial:', error);
        }
      }, 500);
    }
  };

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
      navigation.navigate('WalletDetails', {
        walletAddress: response.data.wallet_address,
      });
      await trackButtonClick('wallet_details_button_clicked');
    } catch (error) {
      handleError(error, 'Failed to check wallet details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`${defaultMessage}: ${errorMessage}`);
    // You can add more specific error handling here if needed
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

  const renderButtons = buttons => (
    <View style={styles.buttonContainer}>
      {buttons.map(({name, action, requiresWallet, icon, disabled}, idx) => {
        const isDisabled = (requiresWallet && !hasWallet) || disabled;
        return (
          <CopilotStep
            text={`This is the ${name} button. You can use it to ${name.toLowerCase()}.`}
            order={idx + 1}
            name={`wallet_step_${idx + 1}`}
            key={idx}>
            <WalkthroughableView style={styles.buttonWrapper}>
              <Card onPress={action} disabled={isDisabled}>
                <Card.Content style={styles.cardContent}>
                  <IconButton
                    icon={icon}
                    size={40}
                    color={
                      isDisabled ? theme.colors.disabled : theme.colors.primary
                    }
                  />
                  <Paragraph
                    style={[
                      styles.buttonLabel,
                      {
                        color: isDisabled
                          ? theme.colors.disabled
                          : theme.colors.text,
                      },
                    ]}>
                    {name}
                  </Paragraph>
                </Card.Content>
              </Card>
            </WalkthroughableView>
          </CopilotStep>
        );
      })}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}>
      <Title style={styles.title}>Wallet Categories</Title>
      {renderButtons(walletCategories)}
      {isLoading && (
        <ActivityIndicator animating={true} color={theme.colors.primary} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContainer: {padding: 16},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonWrapper: {width: '30%', marginBottom: 20},
  cardContent: {alignItems: 'center'},
  buttonLabel: {marginTop: 8, textAlign: 'center'},
});

export default WalletCategoriesPage;
