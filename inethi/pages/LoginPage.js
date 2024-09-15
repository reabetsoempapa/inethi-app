import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {handleLogin} from '../utils/utils';
import {Dialog, Button} from 'react-native-paper';

const LoginPage = ({onLoginSuccess}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (password && username) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [password, username]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/inethitransparent.png')}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />
      <Button
        mode="contained"
        disabled={isButtonDisabled}
        onPress={() =>
          handleLogin(
            username,
            password,
            onLoginSuccess,
            setError,
            setLoading,
            navigation,
          )
        }
        style={styles.button}
        labelStyle={styles.buttonText}>
        Login
      </Button>
      <View style={styles.registerContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Register here</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <Dialog visible={true}>
          <Dialog.Content>
            <ActivityIndicator size="large" color="#4285F4" />
          </Dialog.Content>
        </Dialog>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 150,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4285F4',
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  registerText: {
    textDecorationLine: 'underline',
    color: '#4285F4',
    fontWeight: 'bold',
  },
});

export default LoginPage;
