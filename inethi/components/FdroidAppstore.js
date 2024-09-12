import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert, Linking, ActivityIndicator, ToastAndroid, Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import RNFS from 'react-native-fs';

import { getApps, download } from '../service/FdroidApi';
import * as amplitude from '@amplitude/analytics-react-native';

amplitude.init('d584a34a7957c1300fa733ee33a3a960');

const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
        try {
            let permissions;
            const sdkInt = Platform.Version;
            if (sdkInt >= 33) {
                permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                ];
            } else {
                permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ];
            }

            const granted = await PermissionsAndroid.requestMultiple(
                permissions,
                {
                    title: 'Storage Permission',
                    message: 'This app needs access to your storage to download files',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            if (sdkInt >= 33) {
                const allPermissionsGranted = permissions.every(permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED);
                return allPermissionsGranted;
            } else {
                return granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

export default function FdroidAppstore() {
    const navigation = useNavigation();
    const [apps, setApps] = useState([]);
    const [isMoreInfor, setMoreInfor] = useState({});
    const [downloadProgress, setDownloadProgress] = useState({});
    const [isServerDown, setIsServerDown] = useState(false); // State to track server availability
    const [isLoading, setIsLoading] = useState(true); // For showing the loading spinner

    useEffect(() => {
        const fetchAndCopyApps = async () => {
            const hasPermission = await requestStoragePermission();
            if (hasPermission) {
                setIsLoading(true); // Start the loading spinner
                try {
                    // Set a timeout for 5 seconds to simulate server downtime
                    const appList = await Promise.race([
                        getApps(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Server timeout')), 2000))
                    ]);
                    setApps(appList);
                    setMoreInfor(mapAppsInfor(appList));
                    setIsServerDown(false);
                } catch (error) {
                    setIsServerDown(true);
                    await copyAssetsToLocal();
                    if (Platform.OS === 'android') {
                        ToastAndroid.show('Server is down, loading pre-installed apps', ToastAndroid.LONG);
                    } else {
                        Alert.alert('Server is down', 'Loading pre-installed apps');
                    }
                    console.error('Error fetching apps:', error);
                } finally {
                    setIsLoading(false); // Stop the loading spinner
                }
            }
        };

        fetchAndCopyApps();

        function mapAppsInfor(apps) {
            const appInfoMap = {};
            apps.forEach(app => {
                if (app.packageName) {
                    appInfoMap[app.packageName] = { "Clicked": false };
                } else {
                    console.error('App missing packageName:', app);
                }
            });
            return appInfoMap;
        }
    }, [isServerDown]);

    const copyFileFromAssets = async (assetFile, destPath) => {
        const tempPath = `${destPath}.temp`;

        try {
            const fileExists = await RNFS.exists(destPath);
            if (fileExists) {
                await RNFS.unlink(destPath); // Delete the existing file
            }

            await RNFS.copyFileAssets(assetFile, tempPath); // Copy to a temporary file
            await RNFS.moveFile(tempPath, destPath); // Move to the final path
        } catch (error) {
            if (await RNFS.exists(tempPath)) {
                await RNFS.unlink(tempPath); // Clean up temp file
            }
            console.error(`Error copying ${assetFile}:`, error);
        }
    };

    const ensureDirectoryExists = async (path) => {
        const exists = await RNFS.exists(path);
        if (!exists) {
            await RNFS.mkdir(path);
            return false;  // Directory was just created, so it didn't exist before
        }
        // Check if the directory is empty
        const files = await RNFS.readDir(path);
        return files.length > 0;  // Return true if there are files in the directory
    };

    const copyAssetsToLocal = async () => {
        const downloadDirectory = `${RNFS.DocumentDirectoryPath}/AppDownloads`;

        const directoryHasFiles = await ensureDirectoryExists(downloadDirectory);

        // Define asset files
        const assetFiles = [
            { name: 'ovibrations_radio_station.apk', icon: 'ovibrations_radio_station.png' },
            { name: 'extirpater.apk', icon: 'extirpater.png' },
            { name: 'maps.apk', icon: 'maps.png' },
            { name: 'motionlock.apk', icon: 'motionlock.png' },
            { name: 'hypatia.apk', icon: 'hypatia.png' },
        ];


        const appsWithIcons = assetFiles.map(file => ({
            appName: file.name.split('.')[0],
            packageName: file.name.split('.')[0],
            summary: `This App: ${file.name.split('.')[0]} is preInstalled. Connect to iNethi to get app descriptions and more apps.`,
            icon: `file://${downloadDirectory}/${file.icon}`,
            url: `${downloadDirectory}/${file.name}`,
        }));


        // If the directory already has files, skip copying and set apps
        if (directoryHasFiles) {
            console.log('Files already exist in the directory, skipping copy.');

            
            // Set apps and additional info
            setApps(appsWithIcons);
            setMoreInfor(mapAppsInfor(appsWithIcons));
            return;  // Early exit if files already exist
        }

        // If directory was empty, copy files from assets
        for (const file of assetFiles) {
            const appDestPath = `${downloadDirectory}/${file.name}`;
            const iconDestPath = `${downloadDirectory}/${file.icon}`;
            await copyFileFromAssets(file.icon, iconDestPath);
            await copyFileFromAssets(file.name, appDestPath);
        }

        // Create app info after copying
        
        setApps(appsWithIcons);
        setMoreInfor(mapAppsInfor(appsWithIcons));
    };
    const handleDownloadOrInstall = async (packageName, isServerDown, appUrl) => {
        if (isServerDown) {
            Alert.alert(
                'Manual Installation Required',
                'Server is down. Go to the Download folder and click on MyAppDownloads to install manually.',
                [
                    {
                        text: 'Open Downloads',
                        onPress: () => {
                            Linking.openURL('content://com.android.externalstorage.documents/root/primary');
                        },
                    },
                    { text: 'OK', style: 'cancel' },
                ],
                { cancelable: true }
            );
        } else {
            try {
                setDownloadProgress(prevState => ({ ...prevState, [packageName]: 0 }));
                const response = await download(packageName, (progress) => {
                    setDownloadProgress(prevState => ({ ...prevState, [packageName]: progress }));
                });

                if (response.statusCode === 200) {
                    amplitude.track('App Downloaded', { packageName });
                    Alert.alert('Download Complete', 'Go to Download folder and click on MyAppDownloads', [
                        {
                            text: 'Open Files',
                            onPress: () => {
                                Linking.openURL('content://com.android.externalstorage.documents/root/primary');
                            },
                        },
                        { text: 'OK', style: 'cancel' },
                    ]);
                }
            } catch (error) {
                console.error('Error during download:', error);
            }
        }
    };

    const handleViewClick = (packageName) => {
        setMoreInfor(prevState => {
            const updatedState = { ...prevState };
            if (updatedState[packageName]) {
                updatedState[packageName].Clicked = !updatedState[packageName].Clicked;
            } else {
                console.error(`Package name ${packageName} not found in isMoreInfor`);
            }
            return updatedState;
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Loading apps...</Text>
                </View>
            ) : (
                <ScrollView style={styles.container}>
                    <Button title="Back to Home" onPress={() => navigation.goBack()} />
                    <Text style={styles.title}>App Store</Text>
                    {apps.map(app => (
                        <View key={app.packageName} style={styles.appContainer}>
                            <Image source={{ uri: app.icon }} style={styles.icon} />
                            <Text style={styles.appTitle}>{app.appName}</Text>
                            <Text style={styles.summary}>
                                {app.summary}.{"\n\n"}
                                {!isServerDown && (
                                    <Text style={styles.link} onPress={() => handleViewClick(app.packageName)}>
                                        {" "}view description
                                    </Text>
                                )}
                            </Text>
                            {isMoreInfor[app.packageName]?.Clicked && (
                                <Text style={styles.description}>{app.description}</Text>
                            )}
                            <Button
                                title={isServerDown ? "Install" : "Download"}
                                onPress={() => handleDownloadOrInstall(app.packageName, isServerDown, app.url)}
                            />
                            {downloadProgress[app.packageName] !== undefined && !isServerDown && (
                                <Progress.Bar progress={downloadProgress[app.packageName]} width={null} style={styles.progressBar} />
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    summary: {
        fontSize: 15,
        marginBottom: 20,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    appContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    icon: {
        width: 64,
        height: 64,
        marginBottom: 10,
    },
    appTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        marginBottom: 10,
    },
    progressBar: {
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#4285F4',
    },
});
