import axios from 'axios';
import RNFS from 'react-native-fs';

const baseURL = 'http://196.24.156.25:81'; // eduroam
// const baseURL = "http://192.168.43.138:81"
const api = axios.create({
  baseURL: baseURL,
  timeout: 5000, // Set the timeout to 5 seconds
});

export const getApps = async () => {
  try {
    const response = await api.get('/apps');
    console.log("data received:", response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Error fetching apps: Request timed out');
      throw new Error('Request timed out');
    } else {
      console.error('Error fetching apps:', error);
      throw error;
    }
  }
};

export const downloadApp = async (url) => {
  const downloadDest = `${RNFS.DocumentDirectoryPath}/${url.split('/').pop()}`;

  try {
    const response = await RNFS.downloadFile({
      fromUrl: `${baseURL}${url}`,
      toFile: downloadDest,
    }).promise;

    if (response.statusCode === 200) {
      console.log('File downloaded to:', downloadDest);

      // Use Intent to open the APK file
      const Intent = require('react-native').Intent;
      Intent.openURL(`file://${downloadDest}`);
    } else {
      console.error('Failed to download file:', response.statusCode);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

export const getBaseUrl = () => baseURL;
