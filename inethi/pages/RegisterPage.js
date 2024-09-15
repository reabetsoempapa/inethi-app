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
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {handleLogin} from '../utils/utils';
import {Dialog, Button} from 'react-native-paper';

const RegisterPage = ({onRegisterSuccess, onLoginSuccess}) => {
  const baseURL = 'https://manage-backend.inethicloud.net';
  const registerEndpoint = '/user/keycloak/register/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${baseURL}${registerEndpoint}`,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
        await handleLogin(
          username,
          password,
          onLoginSuccess,
          setError,
          setLoading,
          navigation,
        );
      } else {
        setError('Failed to register');
      }
    } catch (error) {
      console.log(error);
      setError('Failed to register: ' + error.message);
      if (error.response) {
        if (error.response.status === 409) {
          Alert.alert(
            'Error',
            'User name is already in use. Please login or try a new user name.',
          );
        } else if (error.response.status === 500) {
          Alert.alert('Error', 'Error, please contact iNethi support.');
        } else {
          Alert.alert('Error', `Failed to register: ${error.message}`);
        }
      } else {
        Alert.alert('Error', `Failed to register: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password && username && confirmPassword) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [password, confirmPassword, username]);

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
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showPasswordButtonText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        secureTextEntry={!showPassword}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        disabled={isButtonDisabled}
        style={styles.button}
        labelStyle={styles.buttonText}>
        Register
      </Button>
      {loading && (
        <Dialog visible={true}>
          <Dialog.Content>
            <ActivityIndicator size="large" color="#4285F4" />
          </Dialog.Content>
        </Dialog>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  showPasswordButton: {
    padding: 10,
  },
  showPasswordButtonText: {
    color: '#4285F4',
    fontWeight: 'bold',
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
  loginLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4285F4',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default RegisterPage;
