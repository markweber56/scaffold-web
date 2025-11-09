import {useState, useCallback, useContext, useEffect} from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const { login } = useContext(AuthContext);

  const serverBaseUrl = 'http://127.0.0.1:5000/';
  const loginUrl = serverBaseUrl + "auth/login";

  const navigate = useNavigate();

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
        const data = await response.json();
        localStorage.setItem('token', data.data.token);
        setMessageColor('#4fc3f7');
        setMessage(data.message);
        login(data.data.token)
        setShouldRedirect(true); // changing shouldRedirect will cause useEfect to be called
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

  useEffect(() => {
    let timer;
    let periodCount = 1;
    if (shouldRedirect) {
      timer = setInterval(() => {
        setMessage(prevMessage => `${prevMessage}.`);
        periodCount++;

        if (periodCount > 3) {
          clearInterval(timer);

          setTimeout(() => {
            setMessage("Redirecting to Market Page");

            setTimeout(() =>{
              navigate('/market');
            }, 750);
          }, 750);
        }
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]); // [shouldRedirect, navigate] is an array of dependencies, useEffect is called when these dependencies change

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