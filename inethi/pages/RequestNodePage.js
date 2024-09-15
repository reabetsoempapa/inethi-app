import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Card, Text, Title } from 'react-native-paper';

const RequestNodePage = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState(''); // New field for installation address
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name && location && contact && address && description) {
      Alert.alert('Request Sent', 'Your request to add a node has been submitted.');
    } else {
      Alert.alert('Error', 'Please fill out all the fields.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Node Installation Request</Title>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Location of Node</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the node location"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Installation Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the installation address"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Your Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email or phone number"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Additional Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Provide details about the node and your needs"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            Submit Request
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
  },
  card: {
    padding: 25,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    elevation: 5,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 15,
    height: 120,
  },
  submitButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
});

export default RequestNodePage;
