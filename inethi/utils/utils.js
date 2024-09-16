import axios from 'axios';

export const handleLogin = async (
  username,
  password,
  onLoginSuccess,
  setError,
  setLoading,
  navigation,
) => {
  setLoading(true);
  try {
    const response = await axios.post(
      'https://keycloak.inethicloud.net/realms/inethi-global-services/protocol/openid-connect/token',
      `client_id=inethi-app&username=${encodeURIComponent(
        username,
      )}&password=${encodeURIComponent(
        password,
      )}&grant_type=password&scope=openid offline_access`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const {access_token, expires_in, refresh_token} = response.data;
    if (access_token && expires_in && refresh_token) {
      await onLoginSuccess(access_token, expires_in, refresh_token);
      navigation.reset({
        index: 0,
        routes: [{name: 'AppRoutes'}],
      });
    } else {
      setError('No access token received');
    }
  } catch (err) {
    if (err.response) {
      setError(
        `Failed to login: ${
          err.response.data.error_description ||
          err.response.data.error ||
          'Unknown error'
        }`,
      );
    } else if (err.request) {
      setError('No response received from the server.');
    } else {
      setError('Failed to login: ' + err.message);
    }
  } finally {
    setLoading(false);
  }
};
