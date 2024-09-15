import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppBarComponent from '../components/AppBarComponent'; // Import AppBarComponent

const HotspotOptionsPage = ({ logout }) => {
  const navigation = useNavigation();

  return (
    <>
      <AppBarComponent title="Hotspot Options" logout={logout} hideKrone={true} />
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Button
              icon={() => <Ionicons name="wifi-outline" size={24} color="#FFFFFF" />}
              mode="contained"
              onPress={() => {
                navigation.navigate('RequestNode'); // Navigate to RequestNodePage
              }}
              style={styles.button}
              labelStyle={styles.buttonText}
              contentStyle={styles.buttonContent}
            >
              Hotspot Installation
            </Button>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Button
              icon={() => <Ionicons name="map-outline" size={24} color="#FFFFFF" />}
              mode="contained"
              onPress={() => {
                navigation.navigate('Map'); // Navigates to the Map page
              }}
              style={styles.button}
              labelStyle={styles.buttonText}
              contentStyle={styles.buttonContent}
            >
              Discover Hotspots
            </Button>
          </Card.Content>
        </Card>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  card: {
    marginVertical: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

export default HotspotOptionsPage;
