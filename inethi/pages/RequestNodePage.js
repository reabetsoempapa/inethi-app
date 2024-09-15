import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import emailjs from 'emailjs-com';

const RequestNodePage = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const sendEmail = () => {
    const serviceID = 'service_2cpwac7'; // Replace with your EmailJS Service ID
    const templateID = 'template_k3dbj3t'; // Replace with your EmailJS Template ID
    const publicKey = 'fD9rYE_oPHtthKqcz'; // Replace with your EmailJS Public Key

    const templateParams = {
      from_name: name,
      location,
      contact,
      address,
      description,
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then(response => {
        Alert.alert('Success', 'Your request has been sent successfully.');
      })
      .catch(error => {
        Alert.alert('Error', 'There was an issue sending your request.');
        console.error('EmailJS Error:', error);
      });
  };

  const handleSubmit = () => {
    if (name && location && contact && address && description) {
      sendEmail(); // Send email on form submit
      setName('');
      setLocation('');
      setContact('');
      setAddress('');
      setDescription('');
    } else {
      Alert.alert('Error', 'Please fill out all the fields.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Node Installation Request</Title>
          
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter the node location"
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter the installation address"
            value={address}
            onChangeText={setAddress}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your email or phone number"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
          />

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
