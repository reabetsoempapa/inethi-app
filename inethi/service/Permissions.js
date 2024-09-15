import { PermissionsAndroid } from 'react-native';
import { Platform } from 'react-native';
export const requestStoragePermission = async () => {
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
