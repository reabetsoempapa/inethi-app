import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import axios from 'axios';

const BaseURL = "http://192.168.0.168:3007"; // False IP for testing

// General axios configuration to disable caching
const axiosInstance = axios.create({
    baseURL: BaseURL,
    headers: {
        'Cache-Control': 'no-cache',  // Ensure cache is not used
        'Pragma': 'no-cache',         // HTTP/1.0 backward compatibility
        'Expires': '0',               // Prevent caching
    }
});

export const getRating = async (appId) => {
    try {
        const response = await axiosInstance.get(`/rating/${appId}`);
        return response.data.avgRating;
    } catch (error) {
        console.error('Error fetching rating:', error);
        return 0; // Return a default rating if there is an error
    }
};

export const rate = async (rating, appId, userName = null, comment = null) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            console.error('User is not logged in.');
            return;
        }

        // Decode the token payload using Buffer
        const base64Url = token.split('.')[1];
        const decodedPayload = Buffer.from(base64Url, 'base64').toString('utf-8');
        const userId = JSON.parse(decodedPayload).sub;

        console.log("Inside rate function:", userName, comment);

        // Submit the rating with userId, userName, and comment
        await axiosInstance.post(`/rating/${appId}`, { rating, userId, userName, comment });

        // Return the new average rating after submitting
        const response = await axiosInstance.get(`/rating/${appId}`);
        return response.data.avgRating;
    } catch (error) {
        console.error('Error submitting rating:', error);
        return null; // Return null if the rating submission fails
    }
};

export const getAllRatings = async () => {
    try {
        const response = await axiosInstance.get(`/ratings`);
        return response.data; // Return all ratings as an array of objects
    } catch (error) {
        console.error('Error fetching all ratings:', error);
        return []; // Return an empty array if there is an error
    }
};
