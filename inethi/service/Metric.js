import axios from 'axios';

// const url = 'http://10.0.2.2:3001'; // developing url
const url = "http://196.24.156.25:3001";

const recordFeatureUsage = async (feature) => {
    try {
        const response = await axios.post(`${url}/use-feature`, { feature });
        console.log('Feature usage recorded:', response.data);
    } catch (error) {
        console.error('Error recording feature usage:', error);
    }
};

const recordAppDownloaded = async (app) => {
    try {
        const response = await axios.post(`${url}/download-app`, { app });
        console.log("The downloaded app's count has been incremented and recorded. The app:", app);
    } catch (error) {
        console.error('Error recording the downloaded app:', error);
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

export { recordFeatureUsage, recordAppDownloaded, clearDatabase };
