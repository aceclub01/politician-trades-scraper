// DOM Elements
const fetchDataButton = document.getElementById('fetchData');
const fetchChartButton = document.getElementById('fetchChartData');
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const historyBarsInput = document.getElementById('historyBars');
const resolutionInput = document.getElementById('resolution');
const chartDiv = document.getElementById('chart');
let chart;
let lineSeries = null;
let macdSeries = null;
let supports = [];
let resistances = [];

// Create chart instance
const createChart = () => {
    chart = LightweightCharts.createChart(chartDiv, {
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight,
        layout: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
        },
        grid: {
            vertLines: { color: '#eeeeee' },
            horzLines: { color: '#eeeeee' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        priceScale: {
            borderColor: '#cccccc',
        },
        timeScale: {
            borderColor: '#cccccc',
        },
    });

    lineSeries = chart.addCandlestickSeries();
    macdSeries = chart.addHistogramSeries({
        color: '#26a69a', // Default color for MACD histogram
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'macd', // Use a separate price scale for MACD
    });

    console.log('Chart initialized:', chart);
};

// Function to calculate EMA
const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
};

// Function to calculate MACD
const calculateMACD = (data, fastLength = 12, slowLength = 26, signalLength = 9) => {
    const fastEMA = calculateEMA(data, fastLength);
    const slowEMA = calculateEMA(data, slowLength);
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signal = calculateEMA(macd, signalLength);
    const histogram = macd.map((macdVal, i) => macdVal - signal[i]);
    return { macd, signal, histogram };
};

// Function to calculate RSI
const calculateRSI = (data, period = 14) => {
    let gains = [];
    let losses = [];
    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        gains.push(Math.max(change, 0));
        losses.push(Math.max(-change, 0));
    }
    const avgGain = calculateEMA(gains, period);
    const avgLoss = calculateEMA(losses, period);
    const rs = avgGain.map((gain, i) => gain / (avgLoss[i] || 1)); // Avoid division by zero
    const rsi = rs.map(r => 100 - (100 / (1 + r)));
    return rsi;
};

// Function to calculate Awesome Oscillator (AO)
const calculateAO = (high, low, shortPeriod = 5, longPeriod = 34) => {
    const hl2 = high.map((h, i) => (h + low[i]) / 2); // Calculate HL2 (midpoint)
    const shortSMA = calculateEMA(hl2, shortPeriod);
    const longSMA = calculateEMA(hl2, longPeriod);
    const ao = shortSMA.map((short, i) => short - longSMA[i]);
    return ao;
};

// Function to detect divergences
const detectDivergences = (prices, indicatorValues, n = 4) => {
    const divergences = {
        bullish: [],
        bearish: [],
    };

    // Find pivot highs and lows
    const pivotHighs = [];
    const pivotLows = [];
    for (let i = n; i < prices.length - n; i++) {
        const high = prices[i];
        const low = prices[i];
        let isPivotHigh = true;
        let isPivotLow = true;

        for (let j = i - n; j <= i + n; j++) {
            if (prices[j] > high) isPivotHigh = false;
            if (prices[j] < low) isPivotLow = false;
        }

        if (isPivotHigh) pivotHighs.push({ index: i, price: high, indicator: indicatorValues[i] });
        if (isPivotLow) pivotLows.push({ index: i, price: low, indicator: indicatorValues[i] });
    }

    // Detect bearish divergences (price higher, indicator lower)
    for (let i = 1; i < pivotHighs.length; i++) {
        const prev = pivotHighs[i - 1];
        const current = pivotHighs[i];
        if (current.price > prev.price && current.indicator < prev.indicator) {
            divergences.bearish.push({ start: prev, end: current });
        }
    }

    // Detect bullish divergences (price lower, indicator higher)
    for (let i = 1; i < pivotLows.length; i++) {
        const prev = pivotLows[i - 1];
        const current = pivotLows[i];
        if (current.price < prev.price && current.indicator > prev.indicator) {
            divergences.bullish.push({ start: prev, end: current });
        }
    }

    return divergences;
};

// Function to handle null values (interpolation or previous value)
const handleNullValue = (data, index, field) => {
    const quote = data.chart.result[0].indicators.quote[0][field];
    let value = quote[index];

    if (value === null) {
        // Look for the last valid value
        for (let i = index - 1; i >= 0; i--) {
            if (quote[i] !== null) return quote[i];
        }
        // If no previous value, use the next valid value
        for (let i = index + 1; i < quote.length; i++) {
            if (quote[i] !== null) return quote[i];
        }
        return 0; // Default fallback
    }
    return value;
};

// Function to clear all lines
const clearLines = () => {
    supports.forEach(line => chart.removeSeries(line));
    resistances.forEach(line => chart.removeSeries(line));
    supports = [];
    resistances = [];
};

// Function to calculate price at a specific time
const priceAt = (t1, p1, t2, p2, t3) => {
    return p1 + (p2 - p1) * (t3 - t1) / (t2 - t1);
};

// Function to draw support and resistance lines
const drawSupportResistance = (chartData) => {
    if (chartData.length < 2) return; // Need at least 2 points to draw a line

    const historyBars = parseInt(historyBarsInput.value, 10);
    const resolution = parseInt(resolutionInput.value, 10);
    const x2 = Math.round(resolution / 2);

    // Find significant lows (supports)
    let minimums = [];
    for (let i = 0; i < chartData.length; i++) {
        if (i >= historyBars) break;
        if (chartData[i].low === Math.min(...chartData.slice(i - x2, i + x2 + 1).map(d => d.low))) {
            minimums.push({ time: chartData[i].time, value: chartData[i].low });
        }
    }

    // Find significant highs (resistances)
    let maximums = [];
    for (let i = 0; i < chartData.length; i++) {
        if (i >= historyBars) break;
        if (chartData[i].high === Math.max(...chartData.slice(i - x2, i + x2 + 1).map(d => d.high))) {
            maximums.push({ time: chartData[i].time, value: chartData[i].high });
        }
    }

    // Draw support lines
    for (let i = 0; i < minimums.length - 1; i++) {
        const start = minimums[i];
        const end = minimums[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(23, 255, 39, 0.5)', // Green for support
            lineWidth: 2,
        });

        // Extend the line into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: priceAt(start.time, start.value, end.time, end.value, futureTime) },
        ]);

        supports.push(line);
    }

    // Draw resistance lines
    for (let i = 0; i < maximums.length - 1; i++) {
        const start = maximums[i];
        const end = maximums[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(255, 119, 173, 0.5)', // Pink for resistance
            lineWidth: 2,
        });

        // Extend the line into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: priceAt(start.time, start.value, end.time, end.value, futureTime) },
        ]);

        resistances.push(line);
    }
};

// Fetch FX data and update the chart
const fetchAndUpdateChart = async (pair, period) => {
    try {
        console.log(`Fetching chart data for pair: ${pair}, period: ${period}`);

        const response = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);
        const data = await response.json();

        if (data.error) {
            alert('Failed to fetch data');
            return;
        }

        // Log the raw data returned by the API
        console.log('Fetched data:', data);

        // Prepare data for chart with null handling
        const chartData = data.chart.result[0].timestamp.map((timestamp, index) => ({
            time: timestamp,
            open: handleNullValue(data, index, 'open'),
            high: handleNullValue(data, index, 'high'),
            low: handleNullValue(data, index, 'low'),
            close: handleNullValue(data, index, 'close'),
        }));

        // Log the processed chart data
        console.log('Chart data:', chartData);

        // Remove old data
        if (lineSeries) {
            chart.removeSeries(lineSeries);
            lineSeries = null; // Reset the variable
        }
        if (macdSeries) {
            chart.removeSeries(macdSeries);
            macdSeries = null; // Reset the variable
        }
        clearLines(); // Clear existing lines

        // Add new candlestick series
        lineSeries = chart.addCandlestickSeries();
        lineSeries.setData(chartData);

        // Calculate MACD values
        const closePrices = chartData.map(d => d.close);
        const { macd, signal, histogram } = calculateMACD(closePrices);

        // Plot MACD histogram
        const macdData = chartData.map((d, i) => ({
            time: d.time,
            value: histogram[i],
            color: histogram[i] >= 0 ? '#26a69a' : '#ef5350', // Green for positive, red for negative
        }));
        macdSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'macd',
        });
        macdSeries.setData(macdData);

        // Calculate RSI and AO
        const rsi = calculateRSI(closePrices);
        const ao = calculateAO(chartData.map(d => d.high), chartData.map(d => d.low));

        // Detect divergences
        const divergences = detectDivergences(closePrices, histogram);

        // Plot divergences
        divergences.bullish.forEach(divergence => {
            lineSeries.setMarkers([
                {
                    time: chartData[divergence.end.index].time,
                    position: 'belowBar',
                    color: '#00ff00',
                    shape: 'arrowUp',
                    text: 'Bullish Divergence',
                    id: `bullish-${divergence.end.index}`,
                },
            ]);
        });

        divergences.bearish.forEach(divergence => {
            lineSeries.setMarkers([
                {
                    time: chartData[divergence.end.index].time,
                    position: 'aboveBar',
                    color: '#ff0000',
                    shape: 'arrowDown',
                    text: 'Bearish Divergence',
                    id: `bearish-${divergence.end.index}`,
                },
            ]);
        });

        // Draw support and resistance lines
        drawSupportResistance(chartData);
    } catch (error) {
        console.error('Error fetching FX data:', error);
        alert('Failed to fetch FX data. Check the console for details.');
    }
};

// Handle the fetch button click
fetchDataButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;

    try {
        // Fetch and update the chart
        await fetchAndUpdateChart(pair, period);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// Handle the new "Update Chart" button click
fetchChartButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;

    try {
        // Fetch and update the chart only
        await fetchAndUpdateChart(pair, period);
    } catch (error) {
        console.error('Error updating chart:', error);
    }
});

// Initialize chart when the page loads
createChart();