import axios from 'axios';
import RNFS from 'react-native-fs'; // Correctly import RNFS

const BASE_URL = 'http://192.168.0.168:3005';
const INDEX_URL = `${BASE_URL}/repo/index-v2.json`;

const timeout = (ms, errorMessage) => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), ms);
    });
};

export const getApps = async () => {
    try {
        const response = await Promise.race([
            axios.get(INDEX_URL, {
                timeout: 5000, // Set axios timeout to 5 seconds
                headers: {
                    'Cache-Control': 'no-cache', // Disable caching
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }),
            timeout(5000, 'Server is down or taking too long to respond'),
        ]);

        let apps = response.data;
        // console.log("data", apps);

        if (typeof apps === 'string') {
            apps = JSON.parse(apps);
        }

        if (!Array.isArray(apps)) {
            throw new Error('Expected an array but got something else');
        }

        const appList = apps.map(app => ({
            appId: app.id,
            appName: app.appName,
            packageName: app.packageName,
            summary: app.summary,
            description: app.description,
            icon: `${BASE_URL}/repo/${app.icon}`,
            url: `${BASE_URL}${app.url}`,
        }));

        // console.log("Filtered:", appList);
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

export async function download(packageName, progressCallback) {
    try {
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
            return response;
        } else {
            throw new Error('File download failed, file does not exist.');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

const getURL = async (packageName) => {
    try {
        const response = await Promise.race([
            axios.get(INDEX_URL),
            timeout(5000, 'Server is down or taking too long to respond'),
        ]);

        const apps = response.data;
        const app = apps.find(app => app.packageName === packageName);
        console.log("App to download:", app);

        if (!app) {
            throw new Error('App not found');
        }

        return [app.url, app.appName];
    } catch (error) {
        console.error('Error downloading app:', error);
        throw error;
    }
};
