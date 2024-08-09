import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLED_APPS_CACHE_KEY = 'installed_apps_cache';
const CACHED_APPS_KEY = 'cached_apps';
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

// Specific function to get installed apps cache
export const getInstalledAppsCache = async () => {
    return await getCache(INSTALLED_APPS_CACHE_KEY);
};

// Specific function to set installed apps cache
export const setInstalledAppsCache = async (data) => {
    await setCache(INSTALLED_APPS_CACHE_KEY, data);
};

// Specific function to get cached apps cache
export const getCachedAppsCache = async () => {
    return await getCache(CACHED_APPS_KEY);
};

// Specific function to set cached apps cache
export const setCachedAppsCache = async (data) => {
    await setCache(CACHED_APPS_KEY, data);
};

// Invalidate all caches
export const invalidateCache = async () => {
    await AsyncStorage.removeItem(INSTALLED_APPS_CACHE_KEY);
    await AsyncStorage.removeItem(CACHED_APPS_KEY);
};

// Update installed apps cache
export const updateInstalledAppsCache = async (newApp) => {
    const cache = await getInstalledAppsCache();
    if (cache && isCacheValid(cache)) {
        cache.data.push(newApp);
        await setInstalledAppsCache(cache.data);
    } else {
        await setInstalledAppsCache([newApp]);
    }
};

// Update cached apps cache
export const updateCachedAppsCache = async (newApp) => {
    const cache = await getCachedAppsCache();
    if (cache && isCacheValid(cache)) {
        cache.data.push(newApp);
        await setCachedAppsCache(cache.data);
    } else {
        await setCachedAppsCache([newApp]);
    }
};
