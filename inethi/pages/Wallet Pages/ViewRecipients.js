import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  Card,
  Text,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {fetchRecipients} from '../../service/recipient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ViewRecipientsScreen = () => {
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const {state} = route.params || {};

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
      console.log('Grouped recipients:', groupedRecipients); // Debug log
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

  const handleRecipientPress = recipient => {
    if (state?.fromPay) {
      navigation.navigate('Payment', {recipient});
    } else {
      navigation.navigate('RecipientDetails', {recipient});
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <Title style={styles.title}>View Recipients</Title>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0066ff" />
      ) : error ? (
        <Paragraph style={styles.error}>{error}</Paragraph>
      ) : Object.keys(recipients).length > 0 ? (
        Object.keys(recipients)
          .sort()
          .map((letter, index) => {
            console.log('Rendering letter:', letter); // Debug log
            return (
              <View key={index} style={styles.letterSection}>
                <View style={styles.letterContainer}>
                  <Text style={styles.letter}>{letter}</Text>
                </View>
                {recipients[letter].map((recipient, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleRecipientPress(recipient)}>
                    <Card style={styles.recipientCard}>
                      <Card.Content style={styles.recipientContent}>
                        <View style={styles.recipientInfo}>
                          <Ionicons
                            name="person-outline"
                            size={24}
                            color="#0066ff"
                            style={styles.icon}
                          />
                          <View>
                            <Paragraph style={styles.recipientName}>
                              {recipient.name}
                            </Paragraph>
                            <Text style={styles.recipientDetails}>
                              {recipient.wallet_name}
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward-outline"
                          size={24}
                          color="#0066ff"
                        />
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
      ) : (
        <Paragraph style={styles.noRecipientsText}>
          No recipients found.
        </Paragraph>
      )}
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddRecipient')}
        style={styles.addButton}>
        Add New Recipient
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 20,
  },
  title: {
    marginVertical: 16,
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  letterSection: {
    marginBottom: 16,
  },
  letterContainer: {
    backgroundColor: '#0066ff',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  letter: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  recipientCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recipientDetails: {
    fontSize: 14,
    color: '#555',
  },
  noRecipientsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  addButton: {
    margin: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0066ff',
  },
});

export default ViewRecipientsScreen;
