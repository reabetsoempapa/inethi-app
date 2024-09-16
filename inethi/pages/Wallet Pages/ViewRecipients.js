import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  Card,
  Text,
  IconButton,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Recipients</Title>
        <IconButton
          icon="plus"
          size={24}
          color="#007AFF"
          onPress={() => navigation.navigate('AddRecipient')}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : error ? (
          <Paragraph style={styles.error}>{error}</Paragraph>
        ) : Object.keys(recipients).length > 0 ? (
          Object.keys(recipients)
            .sort()
            .map((letter, index) => (
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
                            color="#007AFF"
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
                          color="#007AFF"
                        />
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ))
        ) : (
          <Paragraph style={styles.noRecipientsText}>
            No recipients found.
          </Paragraph>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingTop: 16,
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
    backgroundColor: '#007AFF',
    height: 32,
    width: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  letter: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  recipientCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  recipientDetails: {
    fontSize: 14,
    color: '#555555',
  },
  noRecipientsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#555555',
  },
});

export default ViewRecipientsScreen;
