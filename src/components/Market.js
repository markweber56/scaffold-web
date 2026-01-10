import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchTickers, fetchTickerData, fetchAvailableDates } from '../api/data';
import Select from 'react-select';
import StockChart from './StockChart';

function Market() {
  const { token } = useContext(AuthContext);
  const [allTickers, setAllTickers] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchTickers(token)
      .then(resp => setAllTickers(resp.data.tickers))
      .catch(error => console.error(error));
  }, [token]);

  const tickerOptions = allTickers.map(ticker => ({ value: ticker, label: ticker }));
  const dateOptions = availableDates.map(date => ({ value: date, label: date }));

  const handleTickerChange = (ticker) => {
    setSelectedTicker(ticker);
    setStartDate(null);
    setEndDate(null);
    setAvailableDates([]);
    setChartData(null);

    fetchAvailableDates(token, ticker)
      .then(resp => setAvailableDates(resp.data.dates))
      .catch(error => console.error(error));
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const loadData = () => {
    if (!selectedTicker) return;

    fetchTickerData(token, selectedTicker, startDate, endDate)
      .then(resp => {
        if (!resp.data || resp.data.length === 0) {
          setChartData(null);
          return;
        }
        setChartData(resp.data);
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="market-page">
      <div className="market-container">
        <h1 className="market-header">Market Data</h1>
      </div>
      <div className="controls-container">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '150px' }}>
            <label style={{ color: 'white', fontSize: '12px' }}>Ticker</label>
            <Select
              options={tickerOptions}
              onChange={(option) => handleTickerChange(option.value)}
              placeholder="Select ticker..."
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ color: 'white', fontSize: '12px' }}>Start Date</label>
            <Select
              options={dateOptions}
              onChange={(option) => handleStartDateChange(option?.value)}
              value={startDate ? { value: startDate, label: startDate } : null}
              placeholder="Start date..."
              isDisabled={!selectedTicker}
              isClearable
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ color: 'white', fontSize: '12px' }}>End Date</label>
            <Select
              options={dateOptions}
              onChange={(option) => handleEndDateChange(option?.value)}
              value={endDate ? { value: endDate, label: endDate } : null}
              placeholder="End date..."
              isDisabled={!selectedTicker}
              isClearable
            />
          </div>
          <button
            onClick={loadData}
            disabled={!selectedTicker}
            style={{
              marginTop: '18px',
              padding: '8px 16px',
              cursor: selectedTicker ? 'pointer' : 'not-allowed'
            }}
          >
            Load Data
          </button>
        </div>
      </div>
      <StockChart data={chartData} />
    </div>
  );
}

export default Market;
