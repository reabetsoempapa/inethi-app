import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, PermissionsAndroid, Platform, Alert, Linking, NativeModules, AppState } from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigate } from 'react-router-native';
import { getApps, getBaseUrl } from '../service/api.js';
import * as Progress from 'react-native-progress';
import { recordAppDownloaded } from '../service/Metric.js';
import { getInstalledAppsCache, setInstalledAppsCache, getCachedAppsCache, setCachedAppsCache, isCacheValid, invalidateCache, updateInstalledAppsCache, updateCachedAppsCache } from '../service/Cache.js';

const { InstalledAppsModule } = NativeModules;

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const sdkInt = Platform.Version;
      const permissions = [];

      if (sdkInt >= 33) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
      } else {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(
        permissions,
        {
          title: 'Permissions Required',
          message: 'This app needs access to storage and installed apps list',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      console.log("Permission status:", granted);

      const allPermissionsGranted = permissions.every(permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED);
      if (allPermissionsGranted) {
        console.log('All required permissions granted');
        return true;
      }

      if (permissions.some(permission => granted[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        Alert.alert(
          'Permission Required',
          'Some permissions are required for the app to function properly. Please enable them in the app settings.',
          [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
      }
      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const copyFileFromAssets = async (assetFile, destPath) => {
  try {
    await RNFS.copyFileAssets(assetFile, destPath);
    console.log(`${assetFile} copied to ${destPath}`);
  } catch (error) {
    console.error(`Error copying ${assetFile}:`, error);
  }
};

export default function AppList() {
  const [apps, setApps] = useState([]);
  const [installedApps, setInstalledApps] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const navigate = useNavigate();
  const [appStatus, setInstalledAppsStatus] = useState({});
  const [numDownloaded, setNumDownloaded] = useState(0);
  const [isAppFromCache, setAppFromCache] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        console.log("Permissions granted:", hasPermission);
        let data = [];
        try {
          console.log("before sending request for appstore to the server...");
          data = await getApps();
          console.log("App store data received:", data);
          setApps(data);
        } catch (error) {
          console.error('Error fetching apps from server:', error);
          console.log("Falling back to local cache...");
          data = await fetchCachedApps(); // Fallback to cached apps
          console.log("fetched Data:", data)
          if (data.length === 0) {
            console.warn("No data available in cache.");
            await copyAssetsToLocal();
            data = await fetchCachedApps();
            setApps(data);

          } else {
            console.log("Using cached data:", data);
            setApps(data);
            setAppFromCache(true);

          }
        }

        // Handle installed apps
        const cache = await getInstalledAppsCache();
        let installedAppsData = [];
        if (isCacheValid(cache)) {
          console.log("Using installed apps cache.....", cache.data);
          installedAppsData = cache.data;
        } else {
          console.log("Getting installed apps from phone...");
          installedAppsData = await InstalledAppsModule.getInstalledApps();
          console.log("Installed apps data fetched:", installedAppsData);
          await setInstalledAppsCache(installedAppsData);
          console.log("Installed apps have been cached.");
        }
        setInstalledApps(installedAppsData);
        checkInstalledApps(installedAppsData, data);

      } catch (error) {
        console.error('Error during the fetch or cache process:', error);
        Alert.alert("Error", "Could not load apps. Please check your network connection.");
      }
    };
    const copyAssetsToLocal = async () => {
      const downloadDirectory = `${RNFS.DownloadDirectoryPath}/MyAppDownloads`;
      const assetFiles = [
        'ovibrations radio station.apk',
        'alphabetbook.apk',
        'brickgames.apk',
        'chesswalk.apk',
        'default_icon.png'
      ];

      // Await the filtering and mapping operation
      const appsWithIcons = await Promise.all(
        assetFiles.filter(file => file.endsWith('.apk')).map(file => ({
          name: file,
          icon: `file://${downloadDirectory}/default_icon.png`,
          url: file // Use the file name as the unique key
        }))
      );

      console.log("appwithicons:", appsWithIcons);

      // Set the apps state and log after it's updated
      setApps(appsWithIcons);

      // Log the updated apps state after the next render cycle
      setTimeout(() => {
        console.log("Apps after waiting for state update..", apps);
      }, 0);

      try {
        await RNFS.mkdir(downloadDirectory);
      } catch (error) {
        console.error('Error creating download directory:', error);
      }

      // const cache = await getCachedAppsCache();
      // if (isCacheValid(cache)) {
      //   console.log("Cache is valid, skipping copy from assets.");
      //   return;
      // }

      for (const file of assetFiles) {
        const destPath = `${downloadDirectory}/${file}`;
        try {
          await copyFileFromAssets(file, destPath);
          console.log(`${file} copied to ${destPath}`);
        } catch (error) {
          console.error(`Error copying ${file}:, error`);
        }
      }

      // Update cache with the copied apps info
      await updateCachedAppsCache(appsWithIcons.map(app => ({
        name: app.name,
        url: `${downloadDirectory}/${app.name}`,
        icon: app.icon
      })));
    };

    fetchData();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        fetchData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchCachedApps = async () => {
    console.log("Inside fetchCachedApps")
    try {
      const downloadDirectory = `${RNFS.DownloadDirectoryPath}/MyAppDownloads`;
      const files = await RNFS.readDir(downloadDirectory);
      console.log("file:", files)
      const apps = files.filter(file => file.name.endsWith('.apk')).map(file => ({
        name: file.name,
        url: file.path,
        icon: `file://${downloadDirectory}/default_icon.png`, // Correctly formatted local URI
        description: 'Cached app'
      }));
      console.log("apps:", apps);
      return apps;
    } catch (error) {
      console.error('Error fetching cached apps:', error);
      return [];
    }
  };

  const checkInstalledApps = (installedAppsData, appsData) => {
    try {
      console.log("Checking installed apps...");
      const installedAppStatus = appsData.map((appstoreApp) => {
        const appstoreAppName = appstoreApp.name.split(".")[0];
        console.log("Checking app:", appstoreAppName);

        const matchedApp = installedAppsData.find((app) => app.appName.toLowerCase() === appstoreAppName.toLowerCase());

        console.log("Matched app:", matchedApp);
        return { appName: appstoreApp.name, isInstalled: Boolean(matchedApp) };
      });

      console.log("Installed apps status:", installedAppStatus);

      const installedStatus = {};
      installedAppStatus.forEach(app => {
        installedStatus[app.appName] = app.isInstalled;
      });
      setInstalledAppsStatus(installedStatus);
    } catch (error) {
      console.error("Error checking installed apps:", error);
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

  const downloadApp = async (url, appId) => {
    try {
      const downloadDirectory = await createDownloadDirectory();
      const apkname = url.split('/').pop();
      console.log("App name:", apkname);

      const downloadDest = `${downloadDirectory}/${apkname}`;
      console.log("Download destination:", downloadDest);
      logToFile(`Download dest: ${downloadDest}`);

      const downloadOptions = {
        fromUrl: `${getBaseUrl()}${url}`,
        toFile: downloadDest,
        begin: (res) => {
          console.log('Download has begun', res);

        },
        progress: (res) => {
          if (res.bytesWritten && res.contentLength) {
            let progressPercent = (res.bytesWritten / res.contentLength) * 100;
            console.log(`Progress: ${progressPercent}%`);
            setDownloadProgress((prevProgress) => ({
              ...prevProgress,
              [appId]: progressPercent / 100,
            }));
          } else {
            console.error('Progress update received invalid values', res);
          }
        },
      };

      const response = await RNFS.downloadFile(downloadOptions).promise;

      if (response.statusCode === 200) {
        console.log('File downloaded to:', downloadDest);
        const appname = apkname.split('.')[0];
        recordAppDownloaded(appname);

        const fileExists = await RNFS.exists(downloadDest);
        if (fileExists) {
          console.log("File exists!!");
          Alert.alert(
            'Download Complete',
            "Go to Download folder and click on MyAppDownloads",
            "Then click on the app you want to install",
            [
              {
                text: 'Open Files',
                onPress: () => {
                  Linking.openURL('content://com.android.externalstorage.documents/root/primary');
                  setNumDownloaded(numDownloaded + 1);
                  const newApp = { appName: appname, packageName: 'com.example.package' }; // Update with actual package name if known
                  console.log("newApp:", newApp);
                  updateInstalledAppsCache(newApp); // Update cache with new app
                  setInstalledApps((prevApps) => [...prevApps, newApp]);
                  checkInstalledApps([...installedApps, newApp], apps);
                },
              },
              {
                text: 'OK',
                style: 'cancel',
              },
            ],
            { cancelable: true }
          );
          setDownloadProgress((prevProgress) => ({
            ...prevProgress,
            [appId]: 0,
          }));
        } else {
          console.error('File does not exist after download');
          Alert.alert('Error', 'File does not exist after download.');
        }
      } else {
        console.error('Failed to download file:', response.statusCode);
        Alert.alert('Error', `Failed to download the file. ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      logToFile(`Error: An error occurred while downloading the file. ${error.message}`);
      Alert.alert('Error', `An error occurred while downloading the file: ${error.message}`);
    }
  };

  const openDownloadsFolder = () => {
    // Open the downloads folder for manual installation
    Alert.alert("Go to Download folder and click on MyAppDownloads",
      "Then click on the app you want to install", [
      {
        text: "Open to install", onPress: () => {
          Linking.openURL('content://com.android.externalstorage.documents/root/primary')
            .catch((err) => {
              console.error('Error opening downloads folder:', err);
              Alert.alert('Error', 'An error occurred while opening the downloads folder.');
            })
        },
      }, {
        text: "cancel",
        style: 'cancel',
      },
    ], { cancelable: true });

  };

  const renderAppItem = ({ item }) => {
    const appId = item.url;
    const appInstalled = appStatus[item.name];
    const appCached = isAppFromCache;
    const iconUri = appCached ? item.icon : `${getBaseUrl()}${item.icon}`;

    return (
      <View style={styles.appItem} key={appId}>
        <Image source={{ uri: iconUri }} style={styles.icon} onError={() => console.log(`Failed to load icon for ${item.name}`)} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {appInstalled ? (
          <Text style={styles.installedText}>Installed</Text>
        ) : (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => {
              if (appCached) {
                openDownloadsFolder();
              } else {
                downloadApp(item.url, appId);
              }
            }}
          >
            <Text style={styles.downloadButtonText}>{appCached ? 'Install' : 'Download'}</Text>
          </TouchableOpacity>
        )}
        {downloadProgress[appId] > 0 && (
          <View style={styles.progressContainer}>
            <Progress.Bar
              progress={downloadProgress[appId]}
              width={200}
              color="#007BFF"
            />
            <Text>{Math.floor(downloadProgress[appId] * 100)}%</Text>
          </View>
        )}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigate('/')}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
      <FlatList
        data={apps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.url}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  appItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  installedText: {
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    margin: 10,
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});
