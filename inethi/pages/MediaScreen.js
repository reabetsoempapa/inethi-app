import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MediaScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome to the Media Page</Text>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Movies')}>
          <Text style={styles.boxText}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Music')}>
          <Text style={styles.boxText}>Music</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Shows')}>
          <Text style={styles.boxText}>Shows</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('INethiVideos')}>
          <Text style={styles.boxText}>iNethi-Videos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  boxText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
