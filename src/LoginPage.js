import React, { useState } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  const serverBaseUrl = 'http://127.0.0.1:5000/';
  const loginUrl = serverBaseUrl + "auth/login";

  const handleLogin = async (e) => {
    e.preventDefault();
    // alert(`Email: ${email}\nPassword: ${password}`);

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
  };

  return (
    <div className="full-page">
        <div className="login-container">
        <h2 style={{ color: '#4fc3f7', textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <form onSubmit={handleLogin}>
            <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button type="submit" className="login-button">Login</button>
        </form>
        {<p style={{color: messageColor, textAlign: 'center'}}>{message}</p>}
        </div>
    </div>
  );
}

export default LoginPage;