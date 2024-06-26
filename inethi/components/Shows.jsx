// components/Shows.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchMovies,fetchMovieDetails } from "../Service/api";

const Shows = () => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    fetchMovies().then(response => setShows(response.data)).catch(error => console.error(error));
    fetchMovieDetails();
  }, []);
console.log("Here in shows!!")
console.log(shows)
  return (
    <View>
      <Text>Shows????</Text>
      <FlatList
        data={shows}
        keyExtractor={(item) => item.Id}
        renderItem={({ item }) => <Text>{item.Name}</Text>}
      />
    </View>
  );
};

export default Shows;
