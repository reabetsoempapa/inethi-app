import React, {useState, useEffect} from 'react';
import {AppState, View, StyleSheet, Image} from 'react-native';
import {Appbar, Dialog, Portal, Button, Paragraph} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {useBalance} from '../context/BalanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

const NETWORK_SERVICE_URL = 'https://nextcloud.inethicloud.net/';

const AppBarComponent = ({title, logout}) => {
  const {balance} = useBalance();
  const [visible, setVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const navigation = useNavigation();

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const response = await fetch(NETWORK_SERVICE_URL);
        if (response.ok) {
          setVisible(false);
          await AsyncStorage.removeItem('hasShownNetworkDialog');
        } else {
          showDialogIfNotShown();
        }
      } else {
        showDialogIfNotShown();
      }
    } catch (error) {
      showDialogIfNotShown();
    }
  };

  const showDialogIfNotShown = async () => {
    const hasShown = await AsyncStorage.getItem('hasShownNetworkDialog');
    if (!hasShown) {
      setVisible(true);
      await AsyncStorage.setItem('hasShownNetworkDialog', 'true');
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 60000);

    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'active' && appState.match(/inactive|background/)) {
        await AsyncStorage.removeItem('hasShownNetworkDialog');
        checkConnection();
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [appState]);

  const hideDialog = async () => {
    setVisible(false);
    await AsyncStorage.setItem('hasShownNetworkDialog', 'true');
  };

  const handleInfoPress = () => {
    setInfoVisible(true);
  };

  const hideInfoDialog = () => {
    setInfoVisible(false);
  };

  return (
    <>
      {title ? (
        <Appbar.Header style={styles.appBar}>
          <Appbar.BackAction
            onPress={() => navigation.goBack()}
            color="#FFFFFF"
          />
          <View style={styles.centerContent}>
            <Image
              source={require('../assets/images/inethitransparent.png')}
              style={styles.logo}
            />
            <Appbar.Content title={title} titleStyle={styles.title} />
          </View>
          <View style={styles.iconContainer}>
            <Appbar.Action icon="logout" onPress={logout} color="#FFFFFF" />
            <MaterialCommunityIcons
              name="information-outline"
              size={28}
              color="#FFFFFF"
              onPress={handleInfoPress}
            />
          </View>
        </Appbar.Header>
      ) : null}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Internet Connection</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              You are not connected to iNethi Network. Some features may not be
              available.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={infoVisible} onDismiss={hideInfoDialog}>
          <Dialog.Title>Information</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Here you can add some information for the users, like how to use
              the app or other important details.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideInfoDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#4285F4',
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 50,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Ensure icons are aligned to the right
  },
});

export default AppBarComponent;
