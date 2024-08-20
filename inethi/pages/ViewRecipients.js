import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import {useNavigate} from 'react-router-native';
import {fetchRecipients} from '../service/recipient';

const ViewRecipientsScreen = () => {
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const groupRecipientsByAlphabet = recipients => {
    return recipients.reduce((groups, recipient) => {
      const firstLetter = recipient.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(recipient);
      return groups;
    }, {});
  };

  const fetchAndGroupRecipients = async () => {
    setIsLoading(true);
    try {
      const result = await fetchRecipients();
      const groupedRecipients = groupRecipientsByAlphabet(result);
      setRecipients(groupedRecipients);
    } catch (error) {
      setError(`Error fetching recipients: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGroupRecipients();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>View Recipients</Title>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Paragraph style={styles.error}>{error}</Paragraph>
      ) : Object.keys(recipients).length > 0 ? (
        Object.keys(recipients)
          .sort()
          .map((letter, index) => (
            <View key={index} style={styles.letterSection}>
              <View style={styles.letterContainer}>
                <Title style={styles.letter}>{letter}</Title>
              </View>
              {recipients[letter].map((recipient, idx) => (
                <Card
                  key={idx}
                  style={styles.card}
                  onPress={() =>
                    navigate('/recipient-details', {state: {recipient}})
                  }>
                  <Card.Content>
                    <Paragraph style={styles.recipientText}>
                      {recipient.name}
                    </Paragraph>
                    <Paragraph style={styles.recipientDetails}>
                      {recipient.wallet_address} - {recipient.wallet_name}
                    </Paragraph>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ))
      ) : (
        <Paragraph style={styles.noRecipientsText}>
          No recipients found.
        </Paragraph>
      )}
      <Button
        mode="contained"
        onPress={() => navigate(-1)}
        style={styles.backButton}>
        Go Back
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  letterSection: {
    marginBottom: 24,
  },
  letterContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  letter: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  recipientText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipientDetails: {
    fontSize: 14,
    color: '#555',
  },
  noRecipientsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    width: '100%',
  },
});

export default ViewRecipientsScreen;
