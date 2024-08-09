import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-native';
import { recordFeatureUsage } from '../service/Metric'

export default function ServiceContainer() {
    const navigate = useNavigate();

    const apstoreNav = () => {
        //implement try and catch arround record Feature 
        //if 
        recordFeatureUsage('AppStore');

        navigate('/appstore');
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
