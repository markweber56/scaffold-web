const serverUrl = 'http://127.0.0.1:5000/';

const makeHeader = (token) => ({'Content-Type': 'application/json', 'Authorization': `Bearer: ${token}`})

export const fetchData = (token) => {
  return fetch(serverUrl + 'api/data', {headers: makeHeader(token)})
  .then(response => response.json());
}

export const fetchTickers = (token) => {
  return fetch(serverUrl + 'api/tickers', {
    headers: makeHeader(token)})
    .then(response => response.json())
}

export const fetchTickerData = (token, ticker) => {
  const params = new URLSearchParams({ ticker});
  const url = `${serverUrl}api/ticker-data?${params.toString()}`
  
  return fetch(url, {headers: makeHeader(token)})
  .then(response => response.json())
}