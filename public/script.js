// DOM Elements
const fetchDataButton = document.getElementById('fetchData');
const fetchChartButton = document.getElementById('fetchChartData');
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const fibonacciInput = document.getElementById('fibonacci');
const elliotInput = document.getElementById('elliot');
const diagonalLinesInput = document.getElementById('diagonalLines'); // New input
const chartDiv = document.getElementById('chart');
let chart;
let lineSeries;
let fibonacciLines = [];
let elliotLines = [];

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
    console.log('Chart initialized:', chart);
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

// Function to clear all diagonal lines
const clearDiagonalLines = () => {
    fibonacciLines.forEach(line => chart.removeSeries(line));
    elliotLines.forEach(line => chart.removeSeries(line));
    fibonacciLines = [];
    elliotLines = [];
};

// Function to draw diagonal trendlines
const drawDiagonalTrendlines = (chartData) => {
    if (chartData.length < 2) return; // Need at least 2 points to draw a line

    // Get the number of diagonal lines from the input
    const numLines = parseInt(diagonalLinesInput.value, 10);

    // Calculate the end time (3 months from today)
    const today = new Date();
    const threeMonthsFromToday = new Date(today.setMonth(today.getMonth() + 3));
    const futureTime = Math.floor(threeMonthsFromToday.getTime() / 1000); // Convert to Unix timestamp

    // Step 1: Identify significant highs and lows
    const significantHighs = [];
    const significantLows = [];

    // Select significant points (e.g., highest highs and lowest lows)
    for (let i = 0; i < numLines; i++) {
        const high = chartData.reduce((a, b) => (a.high > b.high ? a : b));
        const low = chartData.reduce((a, b) => (a.low < b.low ? a : b));

        significantHighs.push({ time: high.time, value: high.high });
        significantLows.push({ time: low.time, value: low.low });

        // Remove the selected points to avoid duplicates
        chartData = chartData.filter(data => data.time !== high.time && data.time !== low.time);
    }

    // Step 2: Draw diagonal lines for significant highs
    for (let i = 0; i < significantHighs.length - 1; i++) {
        const start = significantHighs[i];
        const end = significantHighs[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(255, 0, 0, 0.8)', // Red for resistance
            lineWidth: 2,
        });

        // Extend the line 3 months into the future
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: end.value + (end.value - start.value) / (end.time - start.time) * (futureTime - end.time) },
        ]);

        fibonacciLines.push(line); // Store the line for later removal
    }

    // Step 3: Draw diagonal lines for significant lows
    for (let i = 0; i < significantLows.length - 1; i++) {
        const start = significantLows[i];
        const end = significantLows[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(0, 255, 0, 0.8)', // Green for support
            lineWidth: 2,
        });

        // Extend the line 3 months into the future
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: end.value + (end.value - start.value) / (end.time - start.time) * (futureTime - end.time) },
        ]);

        elliotLines.push(line); // Store the line for later removal
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
        chart.removeSeries(lineSeries);
        clearDiagonalLines(); // Clear existing diagonal lines

        // Add new candlestick series
        lineSeries = chart.addCandlestickSeries();
        lineSeries.setData(chartData);

        // Draw diagonal trendlines
        drawDiagonalTrendlines(chartData);

        // Reset chart if no checkbox is active
        if (!fibonacciInput.checked && !elliotInput.checked) {
            lineSeries.setData(chartData);
            return;
        }

        if (fibonacciInput.checked) {
            drawFibonacci(chartData);
        }

        if (elliotInput.checked) {
            drawElliotWave(chartData);
        }
    } catch (error) {
        console.error('Error fetching FX data:', error);
        alert('Failed to fetch FX data. Check the console for details.');
    }
};

// Draw Fibonacci levels
const drawFibonacci = (chartData) => {
    const minPrice = Math.min(...chartData.map(data => data.low));
    const maxPrice = Math.max(...chartData.map(data => data.high));

    const fibonacciLevels = [0.0, 0.236, 0.382, 0.5, 0.618, 1.0];
    const fibonacciLinesArr = fibonacciLevels.map(level => ({
        price: minPrice + (maxPrice - minPrice) * level,
        label: `${(level * 100).toFixed(1)}%`
    }));

    fibonacciLinesArr.forEach(level => {
        const fibLine = chart.addLineSeries({
            color: 'rgba(0, 255, 255, 0.8)',
            lineWidth: 2,
        });

        // Draw the line across the chart time range
        fibLine.setData([
            { time: chartData[0].time, value: level.price },
            { time: chartData[chartData.length - 1].time, value: level.price }
        ]);

        fibonacciLines.push(fibLine);
    });
};

// Draw Elliott Waves with null handling
const drawElliotWave = (chartData) => {
    if (chartData.length < 5) return; // Ensure we have enough data for waves

    const cleanData = chartData.filter(data => data.close !== null); // Remove null values
    if (cleanData.length < 5) return; // Ensure we have at least 5 valid points

    const points = [
        cleanData[0],  // Wave 1
        cleanData[Math.floor(cleanData.length * 0.25)],  // Wave 2
        cleanData[Math.floor(cleanData.length * 0.5)],   // Wave 3
        cleanData[Math.floor(cleanData.length * 0.75)],  // Wave 4
        cleanData[cleanData.length - 1]  // Wave 5
    ];

    points.forEach((point, index) => {
        if (index < points.length - 1) {
            const line = chart.addLineSeries({
                color: 'rgba(255, 165, 0, 0.8)',
                lineWidth: 2,
            });

            // Set data for Elliot Wave lines
            line.setData([
                { time: point.time, value: point.close },
                { time: points[index + 1].time, value: points[index + 1].close }
            ]);

            elliotLines.push(line);
        }
    });
};

// Handle the fetch button click
fetchDataButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;
    const newsLimit = document.getElementById('newsLimit').value;

    try {
        // Fetch FX data
        await fetchAndUpdateChart(pair, period);

        // Fetch fundamentals
        fetchFundamentals(pair);

        // Fetch news
        fetchNews(pair, parseInt(newsLimit, 10));
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

// Handle the diagonal lines input change
diagonalLinesInput.addEventListener('input', () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;

    // Redraw the chart with the updated number of diagonal lines
    fetchAndUpdateChart(pair, period);
});

// Initialize chart when the page loads
createChart();