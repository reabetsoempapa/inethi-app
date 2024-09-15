import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from 'react-native-star-rating';
import { rate, getRating, getAllRatings } from "../service/AppRatingApi";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AppRating({ appId }) {
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [userName, setUserName] = useState('');
    const [comment, setComment] = useState('');
    const [numberOfReviews, setNumberOfReviews] = useState(0);

    const navigation = useNavigation();

    useEffect(() => {
        const checkUserRating = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const base64Url = token.split('.')[1];
                const decodedPayload = JSON.parse(Buffer.from(base64Url, 'base64').toString('utf-8'));
                const userId = decodedPayload.sub;

                const allRatings = await getAllRatings();
                const userRatingData = allRatings.find(rating => rating.app_id === appId && rating.user_id === userId);

                if (userRatingData) {
                    setUserRating(userRatingData.rating);
                    setUserName(userRatingData.user_name || '');
                    setComment(userRatingData.comment || '');
                    setShowCommentInput(false); // Show comment if the user has already rated the app
                }

                // Fetch the current average rating and total number of reviews
                const avg = await getRating(appId);
                setAverageRating(avg);

                // Set the number of reviews for this app
                const appReviews = allRatings.filter(rating => rating.app_id === appId);
                setNumberOfReviews(appReviews.length);
            } catch (error) {
                console.error("Error checking user rating:", error);
            }
        };

        checkUserRating();
    }, [appId]);

    const handleSubmitRating = (rating) => {
        setUserRating(rating);
        setShowCommentInput(true); // Show comment and username input fields after rating
    };

    const handleSubmitComment = async () => {
        try {
            await rate(userRating, appId, userName, comment); // Pass username and comment to backend
            setShowCommentInput(false); // Hide input fields after submission
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    // Navigate to the ReviewPage
    const handleNavigateToReviews = () => {
        navigation.navigate('ReviewPage', { appId });
    };

    return (
        <View>
            <Text style={styles.textStyle}>Average Rating: {averageRating}</Text>
            <StarRating
                disabled={false}
                maxStars={5}
                rating={userRating}
                selectedStar={handleSubmitRating}
                fullStarColor="blue"
                starSize={25}
            />

            {/* Review Icon and number of reviews */}
            <View style={styles.reviewContainer}>
                <TouchableOpacity onPress={handleNavigateToReviews} style={styles.reviewIconContainer}>
                    <Icon name="chatbox-ellipses-outline" size={24} color="gray" />
                    <Text style={styles.reviewText}>{numberOfReviews} Reviews</Text>
                </TouchableOpacity>
            </View>

            {/* Show input fields for username and comment after user selects a rating or has already rated */}
            {showCommentInput && (
                <View style={styles.commentContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username (optional)"
                        value={userName}
                        onChangeText={setUserName}
                    />
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        placeholder="Add a comment (optional)"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                    <Button title="Submit" onPress={handleSubmitComment} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },
    commentContainer: {
        marginTop: 20,
    },
    textStyle: {
        padding: 10,
    },
    reviewContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewText: {
        marginLeft: 5,
        fontSize: 16,
        color: 'gray',
    },
});
