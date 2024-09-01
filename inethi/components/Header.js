// components/Header.js
import React from 'react';
import {Appbar} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import {StyleSheet} from 'react-native';

const Header = ({title}) => {
  const navigate = useNavigate();

  return (
    <Appbar.Header style={styles.header}>
      <Appbar.BackAction onPress={() => navigate(-1)} />
      <Appbar.Content title={title} titleStyle={styles.title} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4285F4',
  },
  title: {
    color: 'white',
  },
});

export default Header;
