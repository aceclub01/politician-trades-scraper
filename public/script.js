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

        // Debugging logs
        console.log('Fetched data:', data);
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
