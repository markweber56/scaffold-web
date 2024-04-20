import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  const serverUrl = 'https://scaffold-server-a636111a2e26.herokuapp.com/';
  // const serverUrl = 'http://127.0.0.1:5000/api/data';

  const fetchData = () => {
    fetch('http://127.0.0.1:5000/api/data')
      .then(response => response.json())
      .then(data => {
        setMessage(data.abc);
        console.log('received data: ', data.abc);
      }) 
      .catch(error => console.error('Error fetching data: ', error));
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
        <button onClick={fetchData}>Fetch Data: {message}</button>
        {message && <p>Message from server: {message}</p>}
      </header>
    </div>
  );
}

export default App;
