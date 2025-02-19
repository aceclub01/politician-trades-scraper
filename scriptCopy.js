const fetchDataButton = document.getElementById('fetchData');
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const fibonacciInput = document.getElementById('fibonacci');
const elliotInput = document.getElementById('elliot');
const chartDiv = document.getElementById('chart');
let chart;
let lineSeries;
let fibonacciLines = [];
let elliotLines = [];
let highLines = [];
let lowLines = [];

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

// Fetch FX data from the server
const fetchFXData = async (pair, period) => {
    try {
        const response = await fetch(`http://localhost:3000/fxdata?pair=${pair}&period=${period}`);
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

        // Debugging logs
        console.log('Fetched data:', data);
        console.log('Chart data:', chartData);

        // Remove old data
        chart.removeSeries(lineSeries);
        fibonacciLines.forEach(line => chart.removeSeries(line));
        elliotLines.forEach(line => chart.removeSeries(line));
        highLines.forEach(line => chart.removeSeries(line));
        lowLines.forEach(line => chart.removeSeries(line));
        fibonacciLines = [];
        elliotLines = [];
        highLines = [];
        lowLines = [];

        // Add new candlestick series
        lineSeries = chart.addCandlestickSeries();
        lineSeries.setData(chartData);

        // Reset chart if no checkbox is active
        if (!fibonacciInput.checked && !elliotInput.checked) {
            lineSeries.setData(chartData);
            return;
        }

        if (fibonacciInput.checked) {
            drawDiagonalFibonacci(chartData);
        }

        if (elliotInput.checked) {
            drawDiagonalElliotWave(chartData);
        }

        drawHighLowDiagonals(chartData); // Add the high/low diagonal lines

    } catch (error) {
        console.error('Error fetching FX data:', error);
    }
};

// Draw Diagonal Fibonacci retracement lines
const drawDiagonalFibonacci = (chartData) => {
    const minPrice = Math.min(...chartData.map(data => data.low));
    const maxPrice = Math.max(...chartData.map(data => data.high));

    const fibonacciLevels = [0.0, 0.236, 0.382, 0.5, 0.618, 1.0];
    const startTime = chartData[0].time;
    const endTime = chartData[chartData.length - 1].time;

    // Calculate price difference
    const priceDiff = maxPrice - minPrice;

    fibonacciLevels.forEach(level => {
        const priceLevel = minPrice + priceDiff * level;

        const fibLine = chart.addLineSeries({
            color: 'rgba(0, 255, 255, 0.8)',
            lineWidth: 2,
            crosshairMarkerVisible: true,
        });

        // Set diagonal line: start from the first point and end at the last point
        fibLine.setData([
            { time: startTime, value: priceLevel },
            { time: endTime, value: priceLevel }
        ]);

        fibonacciLines.push(fibLine);
    });
};

// Draw Diagonal Elliott Waves
const drawDiagonalElliotWave = (chartData) => {
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

            // Set data for Diagonal Elliot Wave lines
            line.setData([
                { time: point.time, value: point.close },
                { time: points[index + 1].time, value: points[index + 1].close }
            ]);

            elliotLines.push(line);
        }
    });
};

// Draw diagonal lines connecting significant highs and lows based on recent data
const drawHighLowDiagonals = (chartData) => {
    const interval = 50; // Number of previous data points to consider (adjustable)
    const dataLength = chartData.length;

    // Ensure there are enough data points
    if (dataLength < interval) {
        console.error('Not enough data to calculate highs and lows');
        return;
    }

    // Focus on the last 'interval' number of points
    const recentData = chartData.slice(dataLength - interval);

    // Find the highest high and lowest low within this interval
    const highs = recentData.map(data => data.high);
    const lows = recentData.map(data => data.low);

    const highestHigh = Math.max(...highs);
    const lowestLow = Math.min(...lows);

    // Find the corresponding indices for the highest high and lowest low
    const highestHighIndex = highs.indexOf(highestHigh);
    const lowestLowIndex = lows.indexOf(lowestLow);

    const highLine = chart.addLineSeries({
        color: 'rgba(255, 0, 0, 0.8)',
        lineWidth: 2,
    });

    const lowLine = chart.addLineSeries({
        color: 'rgba(0, 255, 0, 0.8)',
        lineWidth: 2,
    });

    // Draw the diagonal lines connecting the highest high and lowest low
    highLine.setData([
        { time: recentData[0].time, value: recentData[highestHighIndex].high },
        { time: chartData[dataLength - 1].time, value: recentData[highestHighIndex].high }
    ]);

    lowLine.setData([
        { time: recentData[0].time, value: recentData[lowestLowIndex].low },
        { time: chartData[dataLength - 1].time, value: recentData[lowestLowIndex].low }
    ]);

    highLines.push(highLine);
    lowLines.push(lowLine);
};

// Handle the fetch button click
fetchDataButton.addEventListener('click', () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;

    if (pair) {
        fetchFXData(pair, period);
    } else {
        alert('Please enter a valid FX pair');
    }
});

// Initialize chart
createChart();
