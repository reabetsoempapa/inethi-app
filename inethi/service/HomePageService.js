import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import analytics from '@react-native-firebase/analytics';
import * as amplitude from '@amplitude/analytics-react-native';
import {getToken} from '../utils/tokenUtils';

const baseURL = 'https://manage-backend.inethicloud.net';
const nextcloudURL = 'https://nextcloud.inethicloud.net';

export const checkInternetConnection = async () => {
  try {
    const response = await fetch('https://www.google.com', {method: 'HEAD'});
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const checkWirelessConnection = async () => {
  try {
    const response = await fetch(nextcloudURL, {method: 'HEAD'});
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const syncAnalyticsEvents = async () => {
  try {
    const events =
      JSON.parse(await AsyncStorage.getItem('analyticsEvents')) || [];
    if (events.length > 0) {
      for (const event of events) {
        await analytics().logEvent(event.eventName, event.data);
        await amplitude.track(event.eventName, event.data);
      }
      await AsyncStorage.removeItem('analyticsEvents');
    }
  } catch (error) {
    console.error('Error syncing analytics events:', error);
  }
};

export const logAnalyticsEvent = async (eventName, data) => {
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

const timeout = ms =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms),
  );

export const fetchServices = async () => {
  try {
    const token = await getToken();
    if (!token) return {};

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const urlLocal = 'https://manage-backend.inethicloud.net';
    const urlGlobal =
      'https://manage-backend.inethicloud.net/service/list-by-type/';

    let servicesDataGlobal = {};
    let servicesDataLocal = {};

    try {
      const responseGlobal = await Promise.race([
        axios.get(urlGlobal, config),
        timeout(5000),
      ]);
      servicesDataGlobal = responseGlobal.data.data;
    } catch (err) {
      console.error('Error fetching global data. You may not have Internet.');
    }

    try {
      const responseLocal = await Promise.race([
        axios.get(urlLocal, config),
        timeout(5000),
      ]);
      servicesDataLocal = responseLocal.data.data;
    } catch (err) {
      console.error(
        'Error fetching local data. Are you connected to an iNethi network?',
      );
    }

    const combinedServices = {...servicesDataGlobal, ...servicesDataLocal};

    return combinedServices;
  } catch (err) {
    console.error('Error fetching services:', err);
    throw new Error(`Failed to fetch services: ${err.message}`);
  }
};
