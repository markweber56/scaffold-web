import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CHART_CONFIG, COLORS, GRID_OPACITY, TIMEZONE } from '../config/chartConfig';
import {
  parseChartData,
  groupDataByDate,
  calculateScaleDomain,
  formatTooltipDateTime,
  formatPrice
} from '../utils/chartDataUtils';

const {
  width: w,
  height: h,
  padding: pad,
  leftAxisPadding,
  topPadding,
  bottomPadding,
  dateLabelOffset,
  axisTickCount,
  dataPointRadius
} = CHART_CONFIG;

function StockChart({ data }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) {
      d3.select('.graph').selectAll('svg').remove();
      return;
    }

    renderChart(data);
  }, [data]);

  const renderChart = (rawData) => {
    // Parse and group data
    const plotDataRaw = parseChartData(rawData);
    const plotData = groupDataByDate(plotDataRaw);

    // Calculate scales
    const prices = plotDataRaw.map(pd => pd.price);
    const v30Values = plotDataRaw.map(pd => pd.v30);

    const [priceMin, priceMax] = calculateScaleDomain(prices);
    const [v30Min, v30Max] = calculateScaleDomain(v30Values);

    const yScale = d3.scaleLinear()
      .domain([priceMin, priceMax])
      .range([h - bottomPadding, topPadding]);

    const v30Scale = d3.scaleLinear()
      .domain([v30Min, v30Max])
      .range([h - bottomPadding, topPadding]);

    const dates = Object.keys(plotData);
    const divisionWidth = w / dates.length;

    // Clear existing chart
    d3.select('.graph').selectAll('svg').remove();

    // Store all horizontal hover lines
    const allHorizontalLines = [];

    // Render each day panel
    dates.forEach((date, i) => {
      const svg = d3.select('.graph')
        .append('svg')
        .attr('width', divisionWidth)
        .attr('height', h)
        .attr('id', date)
        .style('overflow', 'visible');

      const dayData = plotData[date].sort((a, b) => a.datetime - b.datetime);
      const xMin = d3.min(dayData, d => d.datetime);
      const xMax = d3.max(dayData, d => d.datetime);

      const leftPad = (i === 0) ? leftAxisPadding : pad;
      const xScale = d3.scaleTime()
        .domain([xMin, xMax])
        .range([leftPad, divisionWidth - pad]);

      // Render chart elements
      renderGridLines(svg, yScale, leftPad, divisionWidth);
      renderBoundaries(svg, leftPad, divisionWidth);
      renderDataPoints(svg, dayData, xScale, yScale, v30Scale);

      const { verticalLine, horizontalLine, tooltip, tooltipRect, tooltipText } =
        renderHoverElements(svg, leftPad, divisionWidth);

      allHorizontalLines.push(horizontalLine);

      renderOverlay(svg, dayData, xScale, yScale, leftPad, divisionWidth,
        verticalLine, allHorizontalLines, tooltip, tooltipRect, tooltipText);

      renderDateLabel(svg, date, i, divisionWidth);
      renderAxes(svg, yScale, v30Scale, i, dates.length, divisionWidth);
    });
  };

  const renderGridLines = (svg, yScale, leftPad, divisionWidth) => {
    const yTicks = yScale.ticks(axisTickCount);

    // Horizontal grid lines
    svg.selectAll('.grid-line-h')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-h')
      .attr('x1', leftPad)
      .attr('x2', divisionWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .style('stroke', COLORS.gridLine)
      .style('stroke-opacity', GRID_OPACITY);

    // Vertical grid line at start of day
    svg.append('line')
      .attr('class', 'grid-line-v')
      .attr('x1', leftPad)
      .attr('x2', leftPad)
      .attr('y1', topPadding)
      .attr('y2', h - bottomPadding)
      .style('stroke', COLORS.gridLine)
      .style('stroke-opacity', GRID_OPACITY);
  };

  const renderBoundaries = (svg, leftPad, divisionWidth) => {
    // X axis line
    svg.append('line')
      .attr('class', 'x-axis')
      .attr('x1', leftPad)
      .attr('x2', divisionWidth)
      .attr('y1', h - bottomPadding)
      .attr('y2', h - bottomPadding)
      .style('stroke', COLORS.axis);

    // Top boundary
    svg.append('line')
      .attr('class', 'boundary-top')
      .attr('x1', leftPad)
      .attr('x2', divisionWidth)
      .attr('y1', topPadding)
      .attr('y2', topPadding)
      .style('stroke', COLORS.gridLine)
      .style('stroke-opacity', GRID_OPACITY);

    // Right boundary
    svg.append('line')
      .attr('class', 'boundary-right')
      .attr('x1', divisionWidth)
      .attr('x2', divisionWidth)
      .attr('y1', topPadding)
      .attr('y2', h - bottomPadding)
      .style('stroke', COLORS.gridLine)
      .style('stroke-opacity', GRID_OPACITY);
  };

  const renderDataPoints = (svg, dayData, xScale, yScale, v30Scale) => {
    // Price data points
    svg.selectAll('circle.price')
      .data(dayData)
      .enter()
      .append('circle')
      .attr('class', 'price')
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => yScale(d.price))
      .attr('r', dataPointRadius)
      .attr('fill', d => d.v30 > 0 ? COLORS.positive : COLORS.negative);

    // v30 data points
    svg.selectAll('circle.v30')
      .data(dayData)
      .enter()
      .append('circle')
      .attr('class', 'v30')
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => v30Scale(d.v30))
      .attr('r', dataPointRadius)
      .attr('fill', COLORS.velocity);
  };

  const renderHoverElements = (svg, leftPad, divisionWidth) => {
    const verticalLine = svg.append('line')
      .attr('class', 'hover-line-v')
      .attr('y1', topPadding)
      .attr('y2', h - bottomPadding)
      .style('stroke', COLORS.axis)
      .style('stroke-width', 1)
      .style('opacity', 0);

    const horizontalLine = svg.append('line')
      .attr('class', 'hover-line-h')
      .attr('x1', 0)
      .attr('x2', divisionWidth)
      .style('stroke', COLORS.axis)
      .style('stroke-width', 1)
      .style('opacity', 0);

    const tooltip = svg.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const tooltipRect = tooltip.append('rect')
      .attr('fill', COLORS.tooltip)
      .attr('rx', 4)
      .attr('ry', 4);

    const tooltipText = tooltip.append('text')
      .attr('fill', COLORS.tooltipText)
      .attr('font-size', '11px')
      .attr('text-anchor', 'start');

    return { verticalLine, horizontalLine, tooltip, tooltipRect, tooltipText };
  };

  const renderOverlay = (svg, dayData, xScale, yScale, leftPad, divisionWidth,
    verticalLine, allHorizontalLines, tooltip, tooltipRect, tooltipText) => {

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('x', leftPad)
      .attr('y', topPadding)
      .attr('width', divisionWidth - leftPad)
      .attr('height', h - bottomPadding - topPadding - 10)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const mouseTime = xScale.invert(mouseX);

        const bisect = d3.bisector(d => d.datetime).left;
        const idx = bisect(dayData, mouseTime);

        let closest;
        if (idx === 0) {
          closest = dayData[0];
        } else if (idx >= dayData.length) {
          closest = dayData[dayData.length - 1];
        } else {
          const d0 = dayData[idx - 1];
          const d1 = dayData[idx];
          closest = (mouseTime - d0.datetime > d1.datetime - mouseTime) ? d1 : d0;
        }

        const xPos = xScale(closest.datetime);
        const yPos = yScale(closest.price);

        verticalLine
          .attr('x1', xPos)
          .attr('x2', xPos)
          .style('opacity', 1);

        allHorizontalLines.forEach(line => {
          line.attr('y1', yPos).attr('y2', yPos).style('opacity', 1);
        });

        const tooltipContent = `${formatTooltipDateTime(closest.datetime)} ET | ${formatPrice(closest.price)}`;
        tooltipText.text(tooltipContent);

        const textBBox = tooltipText.node().getBBox();
        const padding = 6;

        tooltipRect
          .attr('x', -padding)
          .attr('y', -textBBox.height - padding / 2)
          .attr('width', textBBox.width + padding * 2)
          .attr('height', textBBox.height + padding);

        tooltip
          .attr('transform', `translate(${xPos + 15}, ${yPos - 20})`)
          .style('opacity', 1)
          .raise();

        svg.style('position', 'relative').style('z-index', 10);
      })
      .on('mouseout', function() {
        verticalLine.style('opacity', 0);
        tooltip.style('opacity', 0);
        allHorizontalLines.forEach(line => line.style('opacity', 0));
        svg.style('z-index', null);
      });
  };

  const renderDateLabel = (svg, date, index, divisionWidth) => {
    if (index % 2 === 0) {
      svg.append('text')
        .attr('x', divisionWidth / 2)
        .attr('y', h - dateLabelOffset)
        .attr('text-anchor', 'start')
        .attr('transform', `rotate(45, ${divisionWidth / 2}, ${h - dateLabelOffset})`)
        .style('fill', COLORS.axis)
        .style('font-size', '12px')
        .text(date);
    }
  };

  const renderAxes = (svg, yScale, v30Scale, index, totalDates, divisionWidth) => {
    // Left Y-axis for price (first panel only)
    if (index === 0) {
      const yAxis = d3.axisLeft(yScale).ticks(axisTickCount);

      svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(25,0)')
        .call(yAxis);

      svg.selectAll('.axis .tick line').style('stroke', COLORS.axis);
      svg.selectAll('.axis .tick text').style('stroke', COLORS.axis);
      svg.selectAll('.axis path.domain').style('stroke', COLORS.axis);
    }

    // Right Y-axis for v30 (last panel only)
    if (index === totalDates - 1) {
      const v30Axis = d3.axisRight(v30Scale).ticks(axisTickCount);

      svg.append('g')
        .attr('class', 'axis-right')
        .attr('transform', `translate(${divisionWidth - 5},0)`)
        .call(v30Axis);

      svg.selectAll('.axis-right .tick line').style('stroke', COLORS.axis);
      svg.selectAll('.axis-right .tick text').style('stroke', COLORS.axis);
      svg.selectAll('.axis-right path.domain').style('stroke', COLORS.axis);
    }
  };

  return <div className="graph" ref={containerRef}></div>;
}

export default StockChart;
