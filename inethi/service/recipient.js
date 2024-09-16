import AsyncStorage from '@react-native-async-storage/async-storage';

const RECIPIENTS_KEY = 'recipients';

// Store recipients in AsyncStorage
export const addRecipient = async (name, wallet_address, wallet_name) => {
  try {
    const recipients = await fetchRecipients();
    const newRecipient = {name, wallet_address, wallet_name};
    const updatedRecipients = [...recipients, newRecipient];
    await AsyncStorage.setItem(
      RECIPIENTS_KEY,
      JSON.stringify(updatedRecipients),
    );
    return updatedRecipients;
  } catch (error) {
    throw new Error('Failed to add recipient');
  }
};

// Fetch recipients from AsyncStorage
export const fetchRecipients = async () => {
  try {
    const storedRecipients = await AsyncStorage.getItem(RECIPIENTS_KEY);
    return storedRecipients ? JSON.parse(storedRecipients) : [];
  } catch (error) {
    throw new Error('Failed to fetch recipients');
  }
};
