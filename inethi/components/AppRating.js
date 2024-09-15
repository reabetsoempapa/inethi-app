import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import StarRating from 'react-native-star-rating';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function AppRating({ appId }) {
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);

    console.log("id:", appId)

    // Fetch the current average rating from the backend
    useEffect(() => {
        axios.get(`http://192.168.0.168:3005/rating/${appId}`)
            .then(response => {
                setAverageRating(response.data.avgRating);
            })
            .catch(error => console.error('Error fetching rating:', error));
    }, [appId]);

    // Submit a new rating
    const submitRating = async (rating) => {
        try {
            // Retrieve the token from storage
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('User is not logged in.');
                return;
            }

            // Decode the token payload using Buffer
            const base64Url = token.split('.')[1];
            const decodedPayload = Buffer.from(base64Url, 'base64').toString('utf-8');
            const userId = JSON.parse(decodedPayload).sub;

            // Submit the rating with the userId
            axios.post(`http://192.168.0.168:3007/rating/${appId}`, { rating, userId })
                .then(() => {
                    setUserRating(rating);
                    // Re-fetch the average rating after submitting
                    axios.get(`http://192.168.0.168:3007/rating/${appId}`)
                        .then(response => {
                            setAverageRating(response.data.avgRating);
                        });
                })
                .catch(error => console.error('Error submitting rating:', error));
        } catch (error) {
            console.error('Error processing rating submission:', error);
        }
    };

    return (
        <View>
            <Text>Average Rating: {averageRating}</Text>
            <StarRating
                disabled={false}
                maxStars={5}
                rating={userRating}
                selectedStar={submitRating}
                fullStarColor="gold"
            />
        </View>
    );
};


