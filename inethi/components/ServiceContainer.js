import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useNavigate } from '@react-navigation/native';
import * as amplitude from '@amplitude/analytics-react-native';
amplitude.init('d584a34a7957c1300fa733ee33a3a960');


export default function ServiceContainer() {
    // const navigation = useNavigate();

    const apstoreNav = () => {
        try {
            // Track the event using Amplitude
            amplitude.track('AppStore Button Clicked');

            // Implement logic to record that the app store has been visited, if applicable
            // e.g., update some state or make an API call to record the visit

            // Navigate to the App Store page
            // navigation.;
        } catch (error) {
            console.error('Error tracking AppStore button click:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={apstoreNav}>
                <Text style={styles.cardText}>App Store</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        padding: 20,
        backgroundColor: '#007BFF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    cardText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
