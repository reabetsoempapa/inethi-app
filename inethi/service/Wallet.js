import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as amplitude from '@amplitude/analytics-react-native';
import analytics from '@react-native-firebase/analytics';
import {getToken} from '../utils/tokenUtils';

const baseURL = 'https://manage-backend.inethicloud.net';
const walletCreateEndpoint = '/wallet/create/';
const walletOwnershipEndpoint = '/wallet/ownership/';
const walletDetailsEndpoint = '/wallet/details/';

amplitude.init('d641bfb8c1944a8894e65cc64309318e');

export const trackButtonClick = async (eventName, data = {}) => {
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

export const createWallet = async walletName => {
  const token = await getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  return axios.post(
    `${baseURL}${walletCreateEndpoint}`,
    {wallet_name: walletName},
    config,
  );
};

export const checkWalletOwnership = async () => {
  const token = await getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  return axios.get(`${baseURL}${walletOwnershipEndpoint}`, config);
};

export const fetchWalletDetails = async () => {
  const token = await getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  return axios.get(`${baseURL}${walletDetailsEndpoint}`, config);
};
