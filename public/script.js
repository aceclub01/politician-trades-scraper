const fetchDataButton = document.getElementById('fetchData');
const fetchChartButton = document.getElementById('fetchChartData'); // New button
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const fibonacciInput = document.getElementById('fibonacci');
const elliotInput = document.getElementById('elliot');
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
    let value = data.chart.result[0].indicators.quote[0][field][index];

    if (value === null) {
        // Look for the last valid value
        for (let i = index - 1; i >= 0; i--) {
            if (data.chart.result[0].indicators.quote[0][field][i] !== null) {
                return data.chart.result[0].indicators.quote[0][field][i];
            }
        }
        // If no previous value, use the next valid value
        for (let i = index + 1; i < data.chart.result[0].timestamp.length; i++) {
            if (data.chart.result[0].indicators.quote[0][field][i] !== null) {
                return data.chart.result[0].indicators.quote[0][field][i];
            }
        }
        return 0; // Default fallback
    }
    return value;
};

// Function to draw diagonal trendlines
// Function to draw 3 well-spaced diagonal trendlines for highs and lows
const drawDiagonalTrendlines = (chartData) => {
    if (chartData.length < 2) return; // Need at least 2 points to draw a line

    // Step 1: Identify significant highs and lows
    const significantHighs = [];
    const significantLows = [];

    for (let i = 1; i < chartData.length - 1; i++) {
        const prev = chartData[i - 1];
        const current = chartData[i];
        const next = chartData[i + 1];

        // Check for significant highs
        if (current.high > prev.high && current.high > next.high) {
            significantHighs.push({ time: current.time, value: current.high });
        }

        // Check for significant lows
        if (current.low < prev.low && current.low < next.low) {
            significantLows.push({ time: current.time, value: current.low });
        }
    }

    // Step 2: Sort highs and lows by time
    significantHighs.sort((a, b) => a.time - b.time);
    significantLows.sort((a, b) => a.time - b.time);

    // Step 3: Select 3 well-spaced highs and lows
    const selectSpacedPoints = (points) => {
        if (points.length <= 3) return points; // If there are 3 or fewer points, use all of them

        const spacedPoints = [];
        const step = Math.floor(points.length / 3); // Divide into 3 segments

        // Select 1 point from each segment
        spacedPoints.push(points[0]); // Furthest point
        spacedPoints.push(points[step]); // Middle point
        spacedPoints.push(points[2 * step]); // Nearest point

        return spacedPoints;
    };

    const spacedHighs = selectSpacedPoints(significantHighs);
    const spacedLows = selectSpacedPoints(significantLows);

    // Step 4: Draw diagonal lines for highs
    for (let i = 0; i < spacedHighs.length - 1; i++) {
        const start = spacedHighs[i];
        const end = spacedHighs[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(255, 0, 0, 0.8)', // Red for resistance
            lineWidth: 2,
        });

        // Extend the line 3 months into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: end.value + (end.value - start.value) / (end.time - start.time) * (futureTime - end.time) },
        ]);
    }

    // Step 5: Draw diagonal lines for lows
    for (let i = 0; i < spacedLows.length - 1; i++) {
        const start = spacedLows[i];
        const end = spacedLows[i + 1];

        const line = chart.addLineSeries({
            color: 'rgba(0, 255, 0, 0.8)', // Green for support
            lineWidth: 2,
        });

        // Extend the line 3 months into the future
        const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: end.value + (end.value - start.value) / (end.time - start.time) * (futureTime - end.time) },
        ]);
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
        fibonacciLines.forEach(line => chart.removeSeries(line));
        elliotLines.forEach(line => chart.removeSeries(line));
        fibonacciLines = [];
        elliotLines = [];

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

// Initialize chart when the page loads
createChart();