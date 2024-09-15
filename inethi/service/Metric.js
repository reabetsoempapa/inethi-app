
import axios from 'axios';


const url = 'http://192.168.0.168:3001';

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

export { recordFeatureUsage, recordAppDownloaded };


