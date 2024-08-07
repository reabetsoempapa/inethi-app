import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLED_APPS_CACHE_KEY = 'installed_apps_cache';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getCache = async () => {
    const cache = await AsyncStorage.getItem(INSTALLED_APPS_CACHE_KEY);
    return cache ? JSON.parse(cache) : null;
};

export const setCache = async (data) => {
    const cache = {
        data,
        timestamp: Date.now(),
    };
    await AsyncStorage.setItem(INSTALLED_APPS_CACHE_KEY, JSON.stringify(cache));
};

export const isCacheValid = (cache) => {
    return cache && (Date.now() - cache.timestamp) < CACHE_EXPIRY_TIME;
};

export const invalidateCache = async () => {
    await AsyncStorage.removeItem(INSTALLED_APPS_CACHE_KEY);
};

export const updateCache = async (newApp) => {
    const cache = await getCache();
    if (cache && isCacheValid(cache)) {
        cache.data.push(newApp);
        await setCache(cache.data);
    } else {
        await setCache([newApp]);
    }
};
