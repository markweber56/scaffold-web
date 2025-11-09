import React, { useContext, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './styles/App.css';
import LoginPage from './components/LoginPage';
import Market from './components/Market';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './contexts/AuthContext';
import { fetchData } from './api/data';

function Home() {
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleFetch = () => {
    fetchData(token)
    .then(data  => setMessage(data.message))
    .catch(error => setMessage("an error occured"));
  };

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
        <button className="custom-button" onClick={handleFetch}>Fetch Data</button>
        {message && <p>Message from server: {message}</p>}
        <button className="custom-button" onClick={() => navigate('/login')}>Login</button>
        <button className="custom-button" onClick={() => navigate('/market')}>Market</button>
      </header>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path='/market' element={<ProtectedRoute><Market /></ProtectedRoute>} />
    </Routes>
  )
}

export default App;
