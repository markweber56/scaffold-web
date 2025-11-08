import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  const authUrl = 'http://127.0.0.1:5000/auth/authenticate';

  const authenticate = (token) => {
    fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${token}`
      },
      body: JSON.stringify({'token': token})

    }).then(Response => Response.json())
    .then(data => {
      console.log(data.message);
      console.log(data.data);
    })
  };

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      console.log("Use effect has been called, authenticating token");
      authenticate(token);
    }

  }, [navigate]);

  return children;
};

export default ProtectedRoute;