import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from "../contexts/AuthContext";
import { fetchTickers, fetchTickerData } from '../api/data';
import Select from 'react-select';
import * as d3 from 'd3';


function Market() {

  const { token } = useContext(AuthContext)
  const [allTickers, setAllTickers] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('AMZN')
  // const [tickerTimestamps, setTickerTimeStamps] = useState([])
  // const [tickerQuotePrices, setTickerQuotePrices] = useState([])
  const svgRef = useRef();

  useEffect(() => {
    fetchTickers(token)
    .then(resp => setAllTickers(resp.data.tickers))
    .catch(error => console.error(error))
  }, [])

  const w = 900
  const h = 600
  const pad = 1

  const tickerOptions = allTickers.map(ticker => ({value: ticker, label: ticker}))

  const handleSelectionChange = (ticker) => {
    setSelectedTicker(ticker)
    fetchTickerData(token, ticker)
    .then(resp => {

      console.log(resp.data[0][0].slice(0, 10))

      const plotDataRaw = resp.data.map(d => ({
        datetime: new Date(d[0].slice(0, -3)), 
        date: d[0].slice(0, 10),
        price: d[1]
      }));

      const timeStamps = plotDataRaw.map(pd => pd.datetime)
      // const dates = new Set(plotDataRaw.map(pd => pd.date))

      const plotDataGrouped = plotDataRaw.reduce((pdm, {date, datetime, price}) => {
        if (!pdm[date]) {
          pdm[date] = [];
        }

        pdm[date].push({datetime, price});
        return pdm;
      }, {});

      console.log("plot data grouped");
      console.log(plotDataGrouped);

      const plotData = Object.fromEntries(
        Object.entries(plotDataGrouped).filter(([date, dataArray]) => dataArray.length > 1)
      );

      // console.log("plot data");
      // console.log(plotData);


      const prices = plotDataRaw.map(pd => pd.price)
      // setTickerTimeStamps(timeStamps)
      // setTickerQuotePrices(prices)

      console.log(`got ${resp.data.length} prices`)
      console.log(`min: ${d3.min(prices)}`)

      const yScale = d3.scaleLinear()
      .domain([
        d3.min(prices),
        d3.max(prices)
      ])
      .range([h - pad, pad])

      const dates = Object.keys(plotData);
      const divisionWidth = w / dates.length;
      console.log(dates);

      d3.select('.graph')
      .selectAll('svg')
      .remove();

      dates.map((date, i) => {

        var svg = d3.select(".graph")
        .append("svg")
        .attr("width", divisionWidth) 
        .attr("height", h)
        .attr('id', date)
        
        const dayData = plotData[date]
        const xMin = d3.min(dayData, d => d.datetime);
        const xMax = d3.max(dayData, d => d.datetime);

        const xScale = d3.scaleTime()
        .domain([xMin, xMax])
        .range([pad, divisionWidth - pad])

        svg.selectAll("circle")
        .data(dayData)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return xScale(d.datetime);
        })
        .attr("cy", function(d) {
          return yScale(d.price)
        })
        .attr("r", 2)
        .attr("fill", "red")

        if (i == 0) {
          const yAxis = d3.axisLeft(yScale)
            .scale(yScale)
            .ticks(10)

          svg.append("g")
          .attr("class", "axis")
          .attr("fill", "blue")
          .attr("transform", "translate(30,0)")
          .call(yAxis)

          svg.selectAll(".axis .tick line")
            .style("stroke", "white")

          svg.selectAll(".axis .tick text")
          .style("stroke", "white")

          svg.selectAll(".axis path.domain")
          .style("stroke", "white")
        }

      })
    })
    .catch(error => console.error(error))
  }

  return (
  <div className="market-page">
    <div className="market-container">
      <h1 className="market-header">Market Data</h1>
    </div>
    <div className="controls-container">
      <Select options={tickerOptions} onChange={(selectedTicker) => handleSelectionChange(selectedTicker.value)}/>
    </div>
    <div className="graph"></div>
  </div>
  )
}

export default Market;