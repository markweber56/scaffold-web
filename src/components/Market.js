import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../contexts/AuthContext";
import { fetchTickers, fetchTickerData } from '../api/data';
import Select from 'react-select';

function Market() {

  const { token } = useContext(AuthContext)
  const [allTickers, setAllTickers] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('AMZN')
  const [tickerTimestamps, setTickerTimeStamps] = useState([])
  const [tickerQuotePrices, setTickerQuotePrices] = useState([])

  useEffect(() => {
    fetchTickers(token)
    .then(resp => setAllTickers(resp.data.tickers))
    .catch(error => console.error(error))
  }, [])

  const tickerOptions = allTickers.map(ticker => ({value: ticker, label: ticker}))

  const handleSelectionChange = (ticker) => {
    setSelectedTicker(ticker)
    fetchTickerData(token, ticker)
    .then(resp => {
      setTickerTimeStamps(resp.data.timestamps)
      setTickerQuotePrices(resp.data.quote_prices)
      // console.log(resp.data.timestamps)
      // console.log(resp.data.quote_prices)
    })
    .catch(error => console.error(error))
  }

  return (
  <div className="full-page">
    <div className="login-container">
      <h1 style={{color: '#4fc3f7'}}>Market Data</h1>
      <Select options={tickerOptions} onChange={(selectedTicker) => handleSelectionChange(selectedTicker.value)}/>
    </div>
  </div>
  )
}

export default Market;