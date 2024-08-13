import axios from 'axios';
import RNFS from 'react-native-fs'; // Make sure RNFS is correctly imported
const BASE_URL = 'http://10.0.2.2:3005';
const INDEX_URL = `${BASE_URL}/repo/index-v2.json`;

// Fetch the list of apps
export const getApps = async () => {
    try {
        const response = await axios.get(INDEX_URL);

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
        throw error;
    }
};

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


export async function download(packageName) {
    try {
        // Destructure the tuple returned by getURL
        const [url, apkname] = await getURL(packageName);

        const downloadDirectory = await createDownloadDirectory();
        const downloadDest = `${downloadDirectory}/${apkname}.apk`;
        console.log("download dest:", downloadDest)
        console.log("url", url);


        const downloadOptions = {
            fromUrl: `${BASE_URL}${url}`,
            toFile: downloadDest,
            begin: (res) => {
                console.log('Download has begun', res);
            },
            progress: (res) => {
                if (res.bytesWritten && res.contentLength) {
                    let progressPercent = (res.bytesWritten / res.contentLength) * 100;
                    // console.log(`Progress: ${progressPercent}%`);
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

const getURL = async (packageName) => {
    try {
        // Fetch the list of apps to find the specific app
        const response = await axios.get(INDEX_URL);
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
}
