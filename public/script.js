// DOM Elements
const fetchDataButton = document.getElementById('fetchData');
const fetchChartButton = document.getElementById('fetchChartData');
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const intervalSlider = document.getElementById('intervalSlider');
const sliderValue = document.getElementById('sliderValue');
const historyBarsInput = document.getElementById('historyBars');
const resolutionInput = document.getElementById('resolution');
const diagonalLinesInput = document.getElementById('diagonalLines');
const chartDiv = document.getElementById('chart');
let chart;
let lineSeries = null;
let macdSeries = null;
let supports = [];
let resistances = [];

// Initialize slider value display
intervalSlider.addEventListener('input', () => {
    sliderValue.textContent = intervalSlider.value;
});

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
            position: 'right', // Price scale on the right for the price chart
            borderColor: '#cccccc',
        },
        overlayPriceScales: {
            position: 'left', // Price scale on the left for the MACD histogram
            borderColor: '#cccccc',
        },
        timeScale: {
            borderColor: '#cccccc',
        },
    });

    // Add candlestick series for the price chart
    lineSeries = chart.addCandlestickSeries({
        priceScaleId: 'right', // Use the right price scale for the price chart
    });

    // Add histogram series for the MACD
    macdSeries = chart.addHistogramSeries({
        color: 'rgba(38, 166, 154, 0.5)', // 50% transparent green
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'left', // Use a separate price scale for MACD
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
    const diagonalLines = parseInt(diagonalLinesInput.value, 10);
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
    for (let i = 0; i < Math.min(minimums.length - 1, diagonalLines); i++) {
        const start = minimums[i];
        const end = minimums[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(23, 255, 39, 0.5)', // Green for support
            lineWidth: 2,
        });

        // Extend the line into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        const futureValue = priceAt(start.time, start.value, end.time, end.value, futureTime);

        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: futureValue },
        ]);

        supports.push(line);
    }

    // Draw resistance lines
    for (let i = 0; i < Math.min(maximums.length - 1, diagonalLines); i++) {
        const start = maximums[i];
        const end = maximums[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(255, 119, 173, 0.5)', // Pink for resistance
            lineWidth: 2,
        });

        // Extend the line into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        const futureValue = priceAt(start.time, start.value, end.time, end.value, futureTime);

        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: futureValue },
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

        // Prepare data for chart with null handling
        const chartData = data.chart.result[0].timestamp.map((timestamp, index) => ({
            time: timestamp,
            open: handleNullValue(data, index, 'open'),
            high: handleNullValue(data, index, 'high'),
            low: handleNullValue(data, index, 'low'),
            close: handleNullValue(data, index, 'close'),
        }));

        // Remove old data
        if (lineSeries) {
            chart.removeSeries(lineSeries);
            lineSeries = null;
        }
        if (macdSeries) {
            chart.removeSeries(macdSeries);
            macdSeries = null;
        }
        clearLines(); // Clear existing lines

        // Add new candlestick series
        lineSeries = chart.addCandlestickSeries({
            priceScaleId: 'right',
        });
        lineSeries.setData(chartData);

        // Calculate MACD values
        const closePrices = chartData.map(d => d.close);
        const { macd, signal, histogram } = calculateMACD(closePrices);

        // Plot MACD histogram
        const macdData = chartData.map((d, i) => ({
            time: d.time,
            value: histogram[i],
            color: histogram[i] >= 0 ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)', // 50% transparent green/red
        }));
        macdSeries = chart.addHistogramSeries({
            color: 'rgba(38, 166, 154, 0.5)',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'left',
        });
        macdSeries.setData(macdData);

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
    await fetchAndUpdateChart(pair, period);
});

// Handle the "Update Chart" button click
fetchChartButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;
    await fetchAndUpdateChart(pair, period);
});

// Initialize chart when the page loads
createChart();