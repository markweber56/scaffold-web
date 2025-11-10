import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'
const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, setIsAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const authUrl = 'http://127.0.0.1:5000/auth/authenticate';


  useEffect(() => {
    console.log(`is authenticated: ${isAuthenticated}`);
    console.log(`token: ${token}`);
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && token) {
      fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer: ${token}`
        }
      }).then(res => {
        console.log(`status: ${res.status}`)
        if (res.status === 200) {
          return res.json();
        } else {
          setIsAuthenticated(false);
          throw new Error(`Failed to authenticate`);
        }
      })
      .then(data => {
        console.log(`data: ${data.data.authenticated}`)
        setIsAuthenticated(data.data.authenticated);

      })
      .catch(error => {
        console.error(error);
      });
    }
  }, [isAuthenticated, setIsAuthenticated, loading, token, navigate]); // need to review these

  return children;
};

export default ProtectedRoute;