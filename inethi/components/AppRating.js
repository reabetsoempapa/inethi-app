import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import StarRating from 'react-native-star-rating';
import { rate, getRating } from "../service/AppRatingApi";

export default function AppRating({ appId }) {
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [userName, setUserName] = useState('');
    const [comment, setComment] = useState('');

    // Fetch the current average rating from the backend
    useEffect(() => {
        const fetchRating = async () => {
            const avg = await getRating(appId);
            setAverageRating(avg);
        };
        fetchRating();
    }, [appId]);

    // Handle rating submission
    const handleSubmitRating = (rating) => {
        setUserRating(rating);
        setShowCommentInput(true); // Show comment and username input fields after rating
    };

    // Submit comment and username along with rating
    const handleSubmitComment = async () => {
        await rate(userRating, appId, userName, comment); // Pass username and comment to backend
        setShowCommentInput(false); // Hide input fields after submission
    };

    return (
        <View>
            <Text>Average Rating: {averageRating}</Text>
            <StarRating
                disabled={false}
                maxStars={5}
                rating={userRating}
                selectedStar={handleSubmitRating}
                fullStarColor="gold"
            />

            {/* Show input fields for username and comment after user selects a rating */}
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
});
