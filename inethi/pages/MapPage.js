import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('sk.eyJ1IjoicG1hbWJhbWJvIiwiYSI6ImNseG56djZwdDA4cGoycnM2MjN2ZWxoNXIifQ.DVX2kNaurf_IJFPlZYE0zw');

const MapPage = () => {
    const [selectedRouter, setSelectedRouter] = useState(null);
    const [routers, setRouters] = useState([]);
    const [innerCircleSize] = useState(new Animated.Value(10));
    const [outerCircleSize] = useState(new Animated.Value(20));

    useEffect(() => {
        fetch('http://172.16.7.31:8000/monitoring/devices/')
            .then(response => response.json())
            .then(data => {
                setRouters(data.map((item, index) => ({
                    id: index,
                    coordinates: [item.lon, item.lat],
                    ipAddress: item.ip,
                    status: item.status,
                    name: item.name,
                    mac: item.mac
                })));
            })
            .catch(error => console.error('Error fetching router data:', error));
    }, []);

    const handleMouseEnter = () => {
        Animated.timing(outerCircleSize, {
            toValue: 30,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const handleMouseLeave = () => {
        Animated.timing(outerCircleSize, {
            toValue: 20,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const renderRouterMarker = (router) => (
        <MapboxGL.PointAnnotation
            key={router.id}
            id={`router-${router.id}`}
            coordinate={router.coordinates}
            onSelected={() => setSelectedRouter(router)}
        >
            <TouchableOpacity
                onPress={() => setSelectedRouter(router)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <View style={styles.markerContainer}>
                    <Animated.View
                        style={[
                            styles.outerCircle,
                            {
                                width: outerCircleSize,
                                height: outerCircleSize,
                                borderRadius: outerCircleSize.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 50],
                                }),
                            },
                        ]}
                    />
                    <View style={styles.innerCircle} />
                </View>
            </TouchableOpacity>
        </MapboxGL.PointAnnotation>
    );

    const renderPopup = () => {
        if (!selectedRouter) return null;
        return (
            <TouchableWithoutFeedback onPress={() => setSelectedRouter(null)}>
                <View style={styles.popupContainer}>
                    <Animated.View style={styles.popup}>
                        <Text style={styles.popupText}>Name: {selectedRouter.name}</Text>
                        <Text style={styles.popupText}>MAC Address: {selectedRouter.mac}</Text>
                        <Text style={styles.popupText}>IP Address: {selectedRouter.ipAddress}</Text>
                        <Text style={styles.popupText}>Status: {selectedRouter.status}</Text>
                        <TouchableOpacity onPress={() => setSelectedRouter(null)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapcontainer}>
                <MapboxGL.MapView
                    style={styles.map}
                    zoomEnabled={true}
                    scrollEnabled={true}
                >
                    <MapboxGL.Camera
                        zoomLevel={14}
                        centerCoordinate={[18.3585, -34.1378]}
                        bounds={{
                            ne: [18.3685, -34.1278],
                            sw: [18.3485, -34.1478],
                        }}
                    />
                    {routers.map(renderRouterMarker)}
                </MapboxGL.MapView>
                {renderPopup()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapcontainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'black',
    },
    outerCircle: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popupContainer: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
    },
    popup: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
    },
    popupText: {
        fontSize: 16,
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 10,
        padding: 5,
        backgroundColor: 'black',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 14,
    },
});

export default MapPage;
