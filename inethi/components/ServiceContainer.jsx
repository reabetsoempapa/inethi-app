import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ServiceContainer() {
  const navigation = useNavigation();

  const navigateToMedia = () => {
    navigation.navigate('Media');
  };

  const navigateToRadio = () => {
    navigation.navigate('Radio');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.box} onPress={navigateToMedia}>
        <Text style={styles.text}>Media</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.box} onPress={navigateToRadio}>
        <Text style={styles.text}>Radio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  text: {
    fontSize: 18,
  },
});
