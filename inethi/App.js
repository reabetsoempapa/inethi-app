import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ServiceContainer from './components/ServiceContainer';
import MediaScreen from './pages/MediaScreen';
import RadioScreen from './pages/RadioScreen';
import MoviesScreen from './pages/MoviesScreen';
import MusicScreen from './pages/MusicScreen';
import ShowsScreen from './pages/ShowsScreen';
import INethiVideosScreen from './pages/INethiVideosScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={ServiceContainer} />
        <Stack.Screen name="Media" component={MediaScreen} />
        <Stack.Screen name="Radio" component={RadioScreen} />
        <Stack.Screen name="Movies" component={MoviesScreen} />
        <Stack.Screen name="Music" component={MusicScreen} />
        <Stack.Screen name="Shows" component={ShowsScreen} />
        <Stack.Screen name="INethiVideos" component={INethiVideosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
