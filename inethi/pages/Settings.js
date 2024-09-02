import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

const SettingsPage = ({logout}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Page</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SettingsPage;
