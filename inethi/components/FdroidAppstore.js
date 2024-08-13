import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView, Button, PermissionsAndroid, Platform, Alert, Linking, NativeModules, AppState } from 'react-native';

import { getApps, download } from '../service/FdroidApi'; // Ensure this is correctly implemented for React Native

export default function FdroidAppstore() {
    const [apps, setApps] = useState([]);
    const [isMoreInfor, setMoreInfor] = useState({});
    const [downloadProgress, setDownloadProgress] = useState({});

    useEffect(() => {
        async function fetchApps() {
            try {
                const appList = await getApps();
                setApps(appList);
                setMoreInfor(mapAppsInfor(appList));
            } catch (error) {
                console.error('Error fetching apps:', error);
            }
        }

        fetchApps();

        function mapAppsInfor(apps) {
            const appInfoMap = {};
            apps.forEach(app => {
                appInfoMap[app.packageName] = { "Clicked": false };
            });
            return appInfoMap;
        }
    }, []);

    const handleDownload = async (packageName) => {

        const response = await download(packageName);
        if (response.statusCode === 200) {
            console.log('Client-side: File downloaded!!');

            // recordAppDownloaded(packageName);
            //     Alert.alert(
            //         'Download Complete',
            //         "Go to Download folder and click on MyAppDownloads",
            //         "Then click on the app you want to install",
            //         [
            //             {
            //                 text: 'Open Files',
            //                 onPress: () => {
            //                     Linking.openURL('content://com.android.externalstorage.documents/root/primary');

            //                     // const newApp = { appName: appname, packageName}; // Update with actual package name if known
            //                     // console.log("newApp:", newApp);
            //                     // updateInstalledAppsCache(newApp); // Update cache with new app
            //                     // setInstalledApps((prevApps) => [...prevApps, newApp]);
            //                     // checkInstalledApps([...installedApps, newApp], apps);
            //                 },
            //             },
            //             {
            //                 text: 'OK',
            //                 style: 'cancel',
            //             },
            //         ],
            //         { cancelable: true }
            //     );
            //     // setDownloadProgress((prevProgress) => ({
            //     //     ...prevProgress,
            //     //     [appId]: 0,
            //     // }));
            //     // Implement your download logic here using a library like react-native-fetch-blob or other appropriate methods.
            Alert.alert(
                'Download Complete',
                'Go to Download folder and click on MyAppDownloads',
                [
                    {
                        text: 'Open Files',
                        onPress: () => {
                            Linking.openURL('content://com.android.externalstorage.documents/root/primary');
                        },
                    },
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ],
                { cancelable: true }
            );


        }


    };

    const handleViewClick = (packageName) => {
        setMoreInfor(prevState => ({
            ...prevState,
            [packageName]: { "Clicked": !prevState[packageName].Clicked }
        }));
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>App Store</Text>
            {apps.map(app => (
                <View key={app.packageName} style={styles.appContainer}>
                    <Image source={{ uri: app.icon }} style={styles.icon} />
                    <Text style={styles.appTitle}>{app.appName}</Text>
                    <Text style={styles.summary}>
                        {app.summary}.{"\n\n"}

                        <Text style={styles.link} onPress={() => handleViewClick(app.packageName)}>
                            {" "}view description
                        </Text>
                    </Text>
                    {isMoreInfor[app.packageName]?.Clicked && (
                        <Text style={styles.description}>{app.description}</Text>
                    )}
                    <Button title="Download" onPress={() => handleDownload(app.packageName)} />
                </View>
            ))}
        </ScrollView>
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
});


