import { TIMEZONE } from '../config/chartConfig';

/**
 * Parse raw API data into chart-ready format
 */
export const parseChartData = (rawData) => {
  return rawData.map(d => {
    let isoString = d[0];
    if (!isoString.endsWith('Z') && !isoString.includes('+')) {
      isoString += 'Z';
    }
    const utcDate = new Date(isoString);
    const easternDateStr = utcDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
    return {
      datetime: utcDate,
      date: easternDateStr,
      price: d[1],
      v30: d[2]
    };
  });
};

/**
 * Group data by date
 */
export const groupDataByDate = (data) => {
  const grouped = data.reduce((acc, { date, datetime, price, v30 }) => {
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ datetime, price, v30 });
    return acc;
  }, {});

  // Filter out dates with only one data point
  return Object.fromEntries(
    Object.entries(grouped).filter(([, dataArray]) => dataArray.length > 1)
  );
};

/**
 * Calculate min/max with padding for scale domain
 */
export const calculateScaleDomain = (values, paddingPercent = 0.05) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * paddingPercent;
  return [min - padding, max + padding];
};

/**
 * Format datetime for tooltip display
 */
export const formatTooltipDateTime = (datetime) => {
  return datetime.toLocaleString('en-US', { timeZone: TIMEZONE });
};

/**
 * Format price for display
 */
export const formatPrice = (price) => {
  return `$${price.toFixed(2)}`;
};
