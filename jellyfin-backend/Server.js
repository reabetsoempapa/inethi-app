const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const JELLYFIN_BASE_URL = 'http://192.168.0.168:8096'; // Replace with your Jellyfin server URL
const API_TOKEN = '4051b162cc4e4f3dabb6383be9469856'; // Replace with your Jellyfin API token

// Middleware to handle JSON requests
app.use(express.json());

// Function to fetch items from Jellyfin
const fetchItems = async (category) => {
  try {
    const response = await axios.get(`${JELLYFIN_BASE_URL}/Items`, {
      headers: {
        'X-Emby-Token': API_TOKEN,
      },
      params: {
        IncludeItemTypes: category,
        Recursive: true,
        StartIndex: 0,
        Limit: 100,
      },
    });
    console.log(`Fetched ${category}:`, response.data); // Log the response data
    return response.data.Items;
  } catch (error) {
    console.error(`Error fetching ${category}:`, error.message);
    return [];
  }
};

// Function to fetch movie details
const fetchMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${JELLYFIN_BASE_URL}/Items/${movieId}`, {
      headers: {
        'X-Emby-Token': API_TOKEN,
      },
    });
    console.log(`Fetched movie details for ID ${movieId}:`, response.data); // Log the response data
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    return null;
  }
};

// Endpoint for Shows
app.get('/api/shows', async (req, res) => {
  const shows = await fetchItems('Series');
  res.json(shows);
});

// Endpoint for Movies
app.get('/api/movies', async (req, res) => {
  const movies = await fetchItems('Movie');
  res.json(movies);
});

// Endpoint for fetching a specific movie's details and URL
app.get('/api/movie', async (req, res) => {
  const movieId = 'ca646a084e5abf4f2b8adcba79ded051'; // Replace with your movie ID
  if (!movieId) {
    console.log("id empty")
    return res.status(400).json({ error: 'Movie ID is required.' });
  }

  const movieDetails = await fetchMovieDetails(movieId);
  if (movieDetails) {
    if (movieDetails.MediaSources && movieDetails.MediaSources.length > 0) {
      const mediaSource = movieDetails.MediaSources[0];
      const movieUrl = mediaSource.Path || mediaSource.DeliveryUrl;
      console.log("url:",movieUrl)
      res.json({ movieUrl, movieDetails });
    } else {
      res.status(404).json({ error: 'No media sources found for the movie.' });
    }
  } else {
    res.status(400).json({ error: 'Error fetching movie details.' });
  }
});

// Endpoint for Music
app.get('/api/music', async (req, res) => {
  const music = await fetchItems('Audio');
  res.json(music);
});

// Endpoint for Music Videos
app.get('/api/music-videos', async (req, res) => {
  const musicVideos = await fetchItems('MusicVideo');
  res.json(musicVideos);
});

// Endpoint for Home Videos
app.get('/api/home-videos', async (req, res) => {
  const homeVideos = await fetchItems('HomeVideo');
  res.json(homeVideos);
});

// Endpoint for Photos
app.get('/api/photos', async (req, res) => {
  const photos = await fetchItems('Photo');
  res.json(photos);
});

// Endpoint for Books
app.get('/api/books', async (req, res) => {
  const books = await fetchItems('Book');
  res.json(books);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
