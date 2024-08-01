import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, PermissionsAndroid, Platform, Alert, Linking, NativeModules, AppState } from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigate } from 'react-router-native';
import { getApps } from '../service/api.js';
import * as Progress from 'react-native-progress';
import DeviceInfo from 'react-native-device-info';
import { recordAppDownloaded } from '../service/Metric.js';

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
      }
      else {
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

export default function AppList() {
  const [apps, setApps] = useState([]);
  const [installedApps, setInstalledApps] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const navigate = useNavigate();
  const [featureClicked, setFeatureClicked] = useState("");
  const [installedAppsData, setInstalledAppData] = useState([]);
  const [appStatus, setInstalledAppsStatus] = useState({});
  const [numdownloaded, setNumDownloaded] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        console.log("Permissions granted:", hasPermission);

        const installedApps = await InstalledAppsModule.getInstalledApps();
        console.log("Installed apps data fetched:", installedApps);
        setInstalledApps(installedApps);

        const data = await getApps();
        console.log("App store data received:", data);
        setApps(data);

        checkInstalledApps(installedApps, data);
      } catch (error) {
        console.error('Error fetching data or checking installed apps:', error);
      }
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
    if (!exists) {
      await RNFS.mkdir(downloadDirectory);
    }
    return downloadDirectory;
  };

  const downloadApp = async (url, appId) => {
    try {
      const downloadDirectory = await createDownloadDirectory();
      const appname = url.split('/').pop();
      console.log("app namee :", appname);

      const downloadDest = `${downloadDirectory}/${appname}`;
      console.log("Download destination:", downloadDest);

      const downloadOptions = {
        fromUrl: `http://10.0.2.2:81${url}`,
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
        recordAppDownloaded(appname);

        const fileExists = await RNFS.exists(downloadDest);
        if (fileExists) {
          console.log("file exists!!")
          Alert.alert(
            'Download Complete',
            'The Application has been downloaded successfully. Opening the Files app now..',
            [
              {
                text: 'Open Files',
                onPress: () => {
                  Linking.openURL('content://com.android.externalstorage.documents/root/primary');
                  setNumDownloaded(numdownloaded + 1);
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
        Alert.alert('Error', 'Failed to download the file.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'An error occurred while downloading the file.');
    }
  };

  const renderAppItem = ({ item }) => {
    const appId = item.url;
    return (
      <View style={styles.appItem} key={appId}>
        <Image source={{ uri: `http://10.0.2.2:81${item.icon}` }} style={styles.icon} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {appStatus[item.name] ? (
          <Text style={styles.installedText}>Installed</Text>
        ) : (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadApp(item.url, appId)}
          >
            <Text style={styles.downloadButtonText}>Download</Text>
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
        <Text style={styles.backButtonText}>Back</Text>
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
