import axios from 'axios';
import RNFS from 'react-native-fs'; // Make sure RNFS is correctly imported

const BASE_URL = 'http://192.168.0.168:3005';
const INDEX_URL = `${BASE_URL}/repo/index-v2.json`;

// Utility to create a timeout promise
const timeout = (ms, errorMessage) => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), ms);
    });
};

// Fetch the list of apps with a 5-second timeout
export const getApps = async () => {
    try {
        // Wrap the axios request in Promise.race to implement the timeout
        const response = await Promise.race([
            axios.get(INDEX_URL), // Axios request
            timeout(5000, 'Server is down or taking too long to respond'), // 5-second timeout
        ]);

        // Check if the response is a string and parse it
        let apps = response.data;
        if (typeof apps === 'string') {
            console.log('Parsing JSON string');
            apps = JSON.parse(apps);
        }

        // Ensure it's an array before mapping
        if (!Array.isArray(apps)) {
            console.error('Error: Expected an array but got something else:', apps);
            throw new Error('Expected an array but got something else');
        }

        const appList = apps.map(app => ({
            appName: app.appName,
            packageName: app.packageName,
            summary: app.summary,
            description: app.description,
            icon: `${BASE_URL}/repo/${app.icon}`,
            url: `${BASE_URL}${app.url}`,
        }));

        console.log("Filtered:", appList);

        return appList;
    } catch (error) {
        console.error('Error fetching app list:', error);
        throw error; // Pass the error back for handling elsewhere
    }
};

// Download directory setup
const createDownloadDirectory = async () => {
    const downloadDirectory = `${RNFS.DownloadDirectoryPath}/MyAppDownloads`;
    const exists = await RNFS.exists(downloadDirectory);
    console.log("Download path,", downloadDirectory);
    if (!exists) {
        await RNFS.mkdir(downloadDirectory);
        Alert.alert("Directory created:", `${downloadDirectory}`);
    }
    return downloadDirectory;
};

// Download a specific app by package name
export async function download(packageName, progressCallback) {
    try {
        // Destructure the tuple returned by getURL
        const [url, apkname] = await getURL(packageName);

        const downloadDirectory = await createDownloadDirectory();
        const downloadDest = `${downloadDirectory}/${apkname}.apk`;
        console.log("download dest:", downloadDest);
        console.log("url", url);

        const downloadOptions = {
            fromUrl: `${BASE_URL}${url}`,
            toFile: downloadDest,
            begin: (res) => {
                console.log('Download has begun', res);
            },
            progress: (res) => {
                if (res.bytesWritten && res.contentLength) {
                    let progressPercent = (res.bytesWritten / res.contentLength);
                    console.log(`Progress: ${progressPercent * 100}%`);

                    // Call the progress callback with the current progress
                    if (progressCallback) {
                        progressCallback(progressPercent);
                    }
                } else {
                    console.error('Progress update received invalid values', res);
                }
            },
        };

        const response = await RNFS.downloadFile(downloadOptions).promise;
        const fileExists = await RNFS.exists(downloadDest);

        if (fileExists) {
            console.log('File downloaded successfully:', downloadDest);
            return response;  // You can return more information here if needed
        } else {
            throw new Error('File download failed, file does not exist.');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;  // Rethrow the error if you want to handle it higher up the call stack
    }
}

// Fetch the app URL based on the package name
const getURL = async (packageName) => {
    try {
        // Wrap the axios request in Promise.race to implement the timeout
        const response = await Promise.race([
            axios.get(INDEX_URL), // Axios request
            timeout(5000, 'Server is down or taking too long to respond'), // 5-second timeout
        ]);

        const apps = response.data;

        // Find the app that matches the given package name
        const app = apps.find(app => app.packageName === packageName);
        console.log("App to download:", app);

        if (!app) {
            throw new Error('App not found');
        }

        // Return an array containing the URL and app name
        return [app.url, app.appName];
    } catch (error) {
        console.error('Error downloading app:', error);
        throw error;
    }
};
