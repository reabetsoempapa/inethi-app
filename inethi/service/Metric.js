import axios from 'axios';
import RNFS from 'react-native-fs';

const url = "http://196.24.156.25:3001";
const LOCAL_LOG_PATH = `${RNFS.DocumentDirectoryPath}/metric_logs.json`;

const recordFeatureUsage = async (feature) => {
    try {
        const response = await axios.post(`${url}/use-feature`, { feature }, { timeout: 5000 });
        syncLocalData();
        console.log('Feature usage recorded:', response.data);
    } catch (error) {
        console.error('Error recording feature usage:', error);
        await recordLocally({ type: 'feature_usage', data: feature });
    }
};

const recordAppDownloaded = async (app) => {
    try {
        const response = await axios.post(`${url}/download-app`, { app }, { timeout: 5000 });
        syncLocalData()
        console.log("The downloaded app's count has been incremented and recorded. The app:", app);
    } catch (error) {
        console.error('Error recording the downloaded app:', error);
        await recordLocally({ type: 'app_download', data: app });
    }
};

const clearDatabase = async () => {
    try {
        const response = await axios.post(`${url}/clear-database`);
        console.log('Database cleared:', response.data);
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

const recordLocally = async (entry) => {
    try {
        const exists = await RNFS.exists(LOCAL_LOG_PATH);
        let log = [];
        if (exists) {
            const logStr = await RNFS.readFile(LOCAL_LOG_PATH);
            log = JSON.parse(logStr);
        }
        log.push(entry);
        await RNFS.writeFile(LOCAL_LOG_PATH, JSON.stringify(log));
        console.log('Local log updated:', entry);
    } catch (error) {
        console.error('Error writing local log:', error);
    }
};

const syncLocalData = async () => {
    try {
        const exists = await RNFS.exists(LOCAL_LOG_PATH);
        if (!exists) return;

        const logStr = await RNFS.readFile(LOCAL_LOG_PATH);
        const log = JSON.parse(logStr);

        for (const entry of log) {
            try {
                if (entry.type === 'feature_usage') {
                    await axios.post(`${url}/use-feature`, { feature: entry.data }, { timeout: 5000 });
                } else if (entry.type === 'app_download') {
                    await axios.post(`${url}/download-app`, { app: entry.data }, { timeout: 5000 });
                }
                console.log(`Successfully synced: ${entry.type}`);
            } catch (error) {
                console.error(`Error syncing ${entry.type}:`, error);
                // Stop retrying if the server is still not available
                return;
            }
        }

        // Clear local log if all entries are successfully synced
        await RNFS.unlink(LOCAL_LOG_PATH);
        console.log('Local log cleared after successful sync');
    } catch (error) {
        console.error('Error syncing local data:', error);
    }
};

export { recordFeatureUsage, recordAppDownloaded, clearDatabase, syncLocalData };

