import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './styles/App.css';
import LoginPage from './LoginPage';

function Home() {
  const [message, setMessage] = useState('');

  // const serverUrl = 'https://scaffold-server-a636111a2e26.herokuapp.com/api/data';
  const serverUrl = 'http://127.0.0.1:5000/api/data';
  
  const fetchData = () => {
    fetch(serverUrl)
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        console.log('received data: ', data.data);
      }) 
      .catch(error => console.error('Error fetching data: ', error));
  };

  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload or don't.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button className="custom-button" onClick={fetchData}>Fetch Data</button>
        {message && <p>Message from server: {message}</p>}
        <button className="custom-button" onClick={() => navigate('/login')}>Login</button>
      </header>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App;
