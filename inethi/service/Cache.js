import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADED_APPS_CACHE_KEY = 'downloaded_apps_cache';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Generic function to get cache
const getCache = async (key) => {
    const cache = await AsyncStorage.getItem(key);
    return cache ? JSON.parse(cache) : null;
};

// Generic function to set cache
const setCache = async (key, data) => {
    const cache = {
        data,
        timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cache));
};

// Generic function to check cache validity
export const isCacheValid = (cache) => {
    return cache && (Date.now() - cache.timestamp) < CACHE_EXPIRY_TIME;
};

// Specific function to get downloaded apps cache
export const getDownloadedAppsCache = async () => {
    return await getCache(DOWNLOADED_APPS_CACHE_KEY);
};

// Specific function to set downloaded apps cache
export const setDownloadedAppsCache = async (data) => {
    await setCache(DOWNLOADED_APPS_CACHE_KEY, data);
};

// Invalidate all caches
export const invalidateCache = async () => {
    await AsyncStorage.removeItem(DOWNLOADED_APPS_CACHE_KEY);
};
