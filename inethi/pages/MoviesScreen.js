import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchMovies,fetchMovieDetails } from "../Service/api";
export default function MoviesScreen() {

    const [movies, setMovies] = useState([]);
    const [movieDetail,setmovieDetail]=useState()

    useEffect(() => {
      fetchMovies().then(response => setMovies(response.data)).catch(error => console.error(error));
      fetchMovieDetails().then(response=>console.log(response));
    }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Movies Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
