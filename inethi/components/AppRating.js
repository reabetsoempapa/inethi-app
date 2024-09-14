import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import StarRating from 'react-native-star-rating';

const AppRating = ({ appId }) => {
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);

    // Fetch the current average rating from the backend
    useEffect(() => {
        axios.get(`http://localhost:3001/rating/${appId}`)
            .then(response => {
                setAverageRating(response.data.avgRating);
            })
            .catch(error => console.error('Error fetching rating:', error));
    }, [appId]);

    // Submit a new rating
    const submitRating = (rating) => {
        axios.post(`http://localhost:3001/rating/${appId}`, { rating })
            .then(() => {
                setUserRating(rating);
                // Re-fetch the average rating after submitting
                axios.get(`http://localhost:3001/rating/${appId}`)
                    .then(response => {
                        setAverageRating(response.data.avgRating);
                    });
            })
            .catch(error => console.error('Error submitting rating:', error));
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

export default AppRating;
