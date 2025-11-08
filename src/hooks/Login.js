import {useState, useCallback} from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const serverBaseUrl = 'http://127.0.0.1:5000/';
  const loginUrl = serverBaseUrl + "auth/login";

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      });

      if (response.ok) {
        console.log("RESPONSE IS OK!");
        const data = await response.json();
        console.log("response data: ", data);
        console.log("token: ", data.data.token);
        setMessageColor('#4fc3f7');
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        console.error("Error message: ", errorData.message);
        setMessageColor('red');
        setMessage(errorData.message || 'Login failed');
      }

    } catch(error) {
      console.error('An error occured during login: ', error);
      setMessage('An error occured during login.')
    }
  }, [email, password])

  return {
    email,
    setEmail,
    password,
    setPassword,
    message,
    messageColor,
    handleLogin
  }
};

export default Login;