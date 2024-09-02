import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const HelpPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help Page</Text>
      <Text style={styles.text}>
        This is the help page. Here you can find answers to common questions and
        get support for using the app.
      </Text>
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
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HelpPage;
