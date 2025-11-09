const serverUrl = 'http://127.0.0.1:5000/api/data';

export const fetchData = (token) => {
  return fetch(serverUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer: ${token}`
    }}).then(response => response.json());
}