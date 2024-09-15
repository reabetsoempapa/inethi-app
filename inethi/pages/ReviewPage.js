import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getAllRatings } from '../service/AppRatingApi';
import StarRating from 'react-native-star-rating';

export default function ReviewPage({ route }) {
    const { appId } = route.params;
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const allRatings = await getAllRatings();
                const appReviews = allRatings.filter(rating => rating.app_id === appId);
                setReviews(appReviews);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, [appId]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No reviews yet for this app.</Text>
            ) : (
                reviews.map((review, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.userName}>{review.user_name || 'Anonymous'}</Text>
                        <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={review.rating}
                            fullStarColor="blue"
                            starSize={18}
                        />
                        <Text style={styles.comment}>{review.comment || 'No comment provided.'}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    comment: {
        fontSize: 14,
        marginTop: 5,
        color: 'gray',
    },
    noReviewsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    },
});
