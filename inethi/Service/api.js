// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.168:3000/api'; // Replace with your backend URL

export const fetchShows = () => axios.get(`${API_BASE_URL}/shows`);
export const fetchMovies = () => axios.get(`${API_BASE_URL}/movies`);
export const fetchMovieDetails =()=> axios.get(`${API_BASE_URL}/movie`)
export const fetchMusic = () => axios.get(`${API_BASE_URL}/music`);
export const fetchMusicVideos = () => axios.get(`${API_BASE_URL}/music-videos`);
export const fetchHomeVideos = () => axios.get(`${API_BASE_URL}/home-videos`);
export const fetchPhotos = () => axios.get(`${API_BASE_URL}/photos`);
export const fetchBooks = () => axios.get(`${API_BASE_URL}/books`);
