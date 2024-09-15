import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Image, Alert, StyleSheet, ScrollView, Button, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import RNFS from 'react-native-fs';
import { getApps, download } from '../service/FdroidApi';
import * as amplitude from '@amplitude/analytics-react-native';
import AppRating from './AppRating';
import _ from 'lodash';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For minimize icon
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';


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

            const granted = await PermissionsAndroid.requestMultiple(permissions, {
                title: 'Storage Permission',
                message: 'This app needs access to your storage to download files',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            });

            if (sdkInt >= 33) {
                return permissions.every(permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED);
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
    const [filteredApps, setFilteredApps] = useState([]);  // State to store filtered apps
    const [searchQuery, setSearchQuery] = useState('');    // State for search input
    const [isMoreInfor, setMoreInfor] = useState({});
    const [downloadProgress, setDownloadProgress] = useState({});
    const [isServerDown, setIsServerDown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user_id, setUserId] = useState("");
    const [isExpanded, setIsExpanded] = useState({});




    useEffect(() => {
        const fetchAndCopyApps = async () => {
            const hasPermission = await requestStoragePermission();
            if (hasPermission) {
                setIsLoading(true);
                try {
                    const appList = await Promise.race([
                        getApps(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Server timeout')), 3000))
                    ]);
                    setApps(appList);
                    setFilteredApps(appList);  // Initially display all apps
                    setMoreInfor(mapAppsInfor(appList));
                    setIsServerDown(false);
                } catch (error) {
                    setIsServerDown(true);
                    await copyAssetsToLocal();
                    showServerDownMessage();
                    console.error('Error fetching apps:', error);
                } finally {
                    setIsLoading(false);
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

    // Debounce the search input to limit the number of filter operations
    const handleSearch = useCallback(
        _.debounce((query) => {
            setSearchQuery(query);
        }, 300), // 300ms debounce time
        []
    );

    // Toggle expanded/collapsed state for an app
    const toggleExpanded = (packageName) => {
        setIsExpanded(prevState => ({
            ...prevState,
            [packageName]: !prevState[packageName]
        }));
    };

    // Memoized filter function to optimize search performance
    const filteredAppsMemo = useMemo(() => {
        return apps.filter(app =>
            app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [apps, searchQuery]);

    const showServerDownMessage = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show('Server is down, loading pre-installed apps', ToastAndroid.LONG);
        } else {
            Alert.alert('Server is down', 'Loading pre-installed apps');
        }
    };

    const copyFileFromAssets = async (assetFile, destPath) => {
        const tempPath = `${destPath}.temp`;

        try {
            const fileExists = await RNFS.exists(destPath);
            if (fileExists) {
                await RNFS.unlink(destPath);
            }

            await RNFS.copyFileAssets(assetFile, tempPath);
            await RNFS.moveFile(tempPath, destPath);
        } catch (error) {
            if (await RNFS.exists(tempPath)) {
                await RNFS.unlink(tempPath);
            }
            console.error(`Error copying ${assetFile}:`, error);
        }
    };

    const ensureDirectoryExists = async (path) => {
        const exists = await RNFS.exists(path);
        if (!exists) {
            await RNFS.mkdir(path);
            return false;
        }
        const files = await RNFS.readDir(path);
        return files.length > 0;
    };

    const copyAssetsToLocal = async () => {
        const downloadDirectory = `${RNFS.DocumentDirectoryPath}/AppDownloads`;

        const directoryHasFiles = await ensureDirectoryExists(downloadDirectory);

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

        if (directoryHasFiles) {
            console.log('Files already exist in the directory, skipping copy.');
            setApps(appsWithIcons);
            setFilteredApps(appsWithIcons);
            setMoreInfor(mapAppsInfor(appsWithIcons));
            return;
        }

        for (const file of assetFiles) {
            const appDestPath = `${downloadDirectory}/${file.name}`;
            const iconDestPath = `${downloadDirectory}/${file.icon}`;
            await copyFileFromAssets(file.icon, iconDestPath);
            await copyFileFromAssets(file.name, appDestPath);
        }

        setApps(appsWithIcons);
        setFilteredApps(appsWithIcons);
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
                <View style={styles.container}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for apps..."
                        onChangeText={setSearchQuery}
                    />
                    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                        {filteredAppsMemo.length === 0 ? (
                            <Text>No apps found for "{searchQuery}"</Text>
                        ) : (
                            filteredAppsMemo.map(app => (
                                <TouchableOpacity
                                    key={app.packageName}
                                    style={styles.appContainer}
                                    activeOpacity={isExpanded[app.packageName] ? 1 : 0.7}
                                    onPress={() => !isExpanded[app.packageName] && toggleExpanded(app.packageName)}
                                >
                                    <View style={styles.inlineContainer}>
                                        {/* App Icon */}
                                        <Image
                                            source={{ uri: app.icon }}
                                            style={isExpanded[app.packageName] ? styles.expandedIcon : styles.icon}
                                        />



                                        {/* App Name and Summary */}
                                        <View style={styles.textContainer}>
                                            <Text style={styles.appTitle}>{app.appName}</Text>
                                            <Text style={styles.summary}>{app.summary}</Text>
                                        </View>



                                        {/* Minimize Icon */}
                                        {isExpanded[app.packageName] && (
                                            <TouchableOpacity
                                                style={styles.minimizeIcon}
                                                onPress={() => toggleExpanded(app.packageName)}
                                            >
                                                <Ionicons name="remove-outline" size={45} color="red" />
                                            </TouchableOpacity>
                                        )}
                                    </View>



                                    {/* Expanded View */}
                                    {isExpanded[app.packageName] && (
                                        <>
                                            {/* Description */}
                                            <Text style={styles.subTitle}>About this App</Text>
                                            <Text style={styles.description}>{app.description}</Text>

                                            {/* Download Button */}
                                            <TouchableOpacity
                                                style={styles.downloadButton}
                                                onPress={() => handleDownloadOrInstall(app.packageName, isServerDown, app.url)}
                                            >
                                                <Text style={styles.downloadButtonText}>{isServerDown ? "Install" : "Download"}</Text>
                                            </TouchableOpacity>

                                            {/* Download Progress */}
                                            {downloadProgress[app.packageName] !== undefined && !isServerDown && (
                                                <Progress.Bar progress={downloadProgress[app.packageName]} width={null} style={styles.progressBar} />
                                            )}

                                            {/* App Rating Component */}
                                            {app.appId ? <AppRating appId={app.appId} /> : null}
                                        </>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
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
    inlineContainer: {
        flexDirection: 'row', // Makes the items inline
        alignItems: 'center', // Aligns items vertically in the center
    },
    icon: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    expandedIcon: {
        width: 64,
        height: 64,
        marginRight: 10,
    },
    minimizeIcon: {
        marginLeft: 'auto', // Pushes the minimize icon to the right
        padding: 10,
    },
    textContainer: {
        flex: 1, // Ensures the text container takes up remaining space
    },
    appTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        textAlign: "center"
    },
    summary: {
        fontSize: 12,
        marginBottom: 10,
        color: "black",
        fontWeight: "bold",
        textAlign: "center"
    },
    description: {
        fontSize: 12,
        marginBottom: 10,
        color: "#343540",
        fontFamily: "Cochin",
        letterSpacing: 1,
        lineHeight: 20,
    },
    downloadButton: {
        backgroundColor: '#4285F4',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
    subTitle: {
        paddingTop: 15,
        paddingBottom: 5,
        color: "#1a1c36",
        fontWeight: "500"
    }

});
