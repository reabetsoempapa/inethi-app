// components/Header.js
import React from 'react';
import {Appbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

const Header = ({title}) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header style={styles.header}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title={title} titleStyle={styles.title} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff', // Matches the white background
  },
  title: {
    color: '#4285F4', // Matches the blue color
    fontSize: 20, // Adjust to match the size
    textAlign: 'center', // Center align the title
  },
});

export default Header;
