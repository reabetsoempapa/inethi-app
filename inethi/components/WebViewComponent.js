import React, {useState} from 'react';
import {WebView} from 'react-native-webview';
import {useNavigation, useRoute} from '@react-navigation/native'; // Updated imports
import {Button} from 'react-native-paper';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';

const WebViewComponent = () => {
  const navigation = useNavigation(); // Replacing useNavigate
  const route = useRoute(); // Replacing useLocation
  const {url} = route.params || {}; // Extracting URL from route params
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <>
      <Button
        icon="arrow-left"
        onPress={() => navigation.goBack()} // Updated navigation
        style={{margin: 10}}>
        Go Back
      </Button>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading page</Text>
        </View>
      ) : (
        <WebView
          source={{uri: url}}
          onError={e => setError(e.nativeEvent)}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.centered}
            />
          )}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WebViewComponent;
