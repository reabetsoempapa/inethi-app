import React, {useState, useEffect} from 'react';
import {AppState, View, StyleSheet, Image, Text} from 'react-native';
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
  const [isOnline, setIsOnline] = useState(true);
  const [data, setData] = useState('1GB');
  const [time, setTime] = useState('12:00');

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const response = await fetch(NETWORK_SERVICE_URL);
        if (response.ok) {
          setVisible(false);
          setIsOnline(true);
          await AsyncStorage.removeItem('hasShownNetworkDialog');
        } else {
          showDialogIfNotShown();
          setIsOnline(false);
        }
      } else {
        showDialogIfNotShown();
        setIsOnline(false);
      }
    } catch (error) {
      showDialogIfNotShown();
      setIsOnline(false);
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
      <Appbar.Header style={styles.appBar}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {title && (
              <Appbar.BackAction
                onPress={() => navigation.goBack()}
                color="#FFFFFF"
              />
            )}
            <Image
              source={require('../assets/images/inethitransparent.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.centerSection}>
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.balanceText}>{balance}</Text>
            <View style={styles.iconContainer}>
              <Appbar.Action icon="logout" onPress={logout} color="#FFFFFF" />
              <MaterialCommunityIcons
                name="information-outline"
                size={28}
                color="#FFFFFF"
                onPress={handleInfoPress}
              />
            </View>
          </View>
        </View>
      </Appbar.Header>
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
    height: 'auto',
    paddingVertical: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    //fontWeight: 'bold',
    marginLeft: 10,
  },
  logo: {
    width: 40,
    height: 32,
    marginRight: 10,
    resizeMode: 'contain',
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
    marginLeft: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AppBarComponent;
