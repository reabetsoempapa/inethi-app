import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeRouter, Route, Routes } from 'react-router-native';
import HomePage from './pages/HomePage'; // Assuming you have a HomePage component
import AppBarComponent from './components/AppBarComponent'; // AppBar component to be created
import WebViewComponent from './components/WebViewComponent';
const App = () => (
  <SafeAreaProvider>
    <NativeRouter>
      <AppBarComponent />
      <Routes>
        <Route exact path="/" element={<HomePage/>} />
        <Route path="/webview" element={<WebViewComponent />}/> 
      </Routes>
      
    </NativeRouter>
  </SafeAreaProvider>
);

export default App;