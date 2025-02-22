const fetchDataButton = document.getElementById('fetchData');
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const fibonacciInput = document.getElementById('fibonacci');
const elliotInput = document.getElementById('elliot');
const intervalSlider = document.getElementById('intervalSlider');
const sliderValue = document.getElementById('sliderValue');
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

// Function to prevent extreme data spikes by smoothing out values that are too far apart
const preventExtremeSpikes = (prevData, currData, nextData) => {
    if (prevData && currData && nextData) {
        const maxAllowedChange = 0.1; // Maximum allowed percentage change
        const prevClose = prevData.close;
        const currClose = currData.close;
        const nextClose = nextData.close;

        // Calculate percentage change from previous to current and current to next
        const changePrev = Math.abs((currClose - prevClose) / prevClose);
        const changeNext = Math.abs((nextClose - currClose) / currClose);

        // If the change is too large, smooth the current value
        if (changePrev > maxAllowedChange || changeNext > maxAllowedChange) {
            currData.close = (prevClose + nextClose) / 2;
        }
    }
    return currData;
};

// Helper function to detect outliers using the IQR method
const detectOutliers = (data, field = 'close', threshold = 1.5) => {
    const values = data.map(d => d[field]).filter(val => val !== null); // Extract values
    if (values.length === 0) return [];

    // Calculate quartiles
    values.sort((a, b) => a - b);
    const Q1 = values[Math.floor(values.length * 0.25)];
    const Q3 = values[Math.floor(values.length * 0.75)];
    const IQR = Q3 - Q1;

    // Define outlier bounds
    const lowerBound = Q1 - threshold * IQR;
    const upperBound = Q3 + threshold * IQR;

    // Identify outliers
    const outliers = data.filter(d => d[field] < lowerBound || d[field] > upperBound);
    return outliers;
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

        // Prepare data for chart with null handling and smoothing
        const chartData = data.chart.result[0].timestamp.map((timestamp, index) => {
            const prevData = data.chart.result[0].indicators.quote[0][index - 1];
            const currData = {
                time: timestamp,
                open: handleNullValue(data, index, 'open'),
                high: handleNullValue(data, index, 'high'),
                low: handleNullValue(data, index, 'low'),
                close: handleNullValue(data, index, 'close'),
            };
            const nextData = data.chart.result[0].indicators.quote[0][index + 1];

            return preventExtremeSpikes(prevData, currData, nextData);
        });

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

// Draw Diagonal Fibonacci retracement lines (ignoring outliers)
const drawDiagonalFibonacci = (chartData) => {
    // Detect and exclude outliers
    const outliers = detectOutliers(chartData, 'close');
    const cleanData = chartData.filter(data => !outliers.includes(data));

    const minPrice = Math.min(...cleanData.map(data => data.low));
    const maxPrice = Math.max(...cleanData.map(data => data.high));

    const fibonacciLevels = [0.0, 0.236, 0.382, 0.5, 0.618, 1.0];
    const startTime = cleanData[0].time;
    const endTime = cleanData[cleanData.length - 1].time;

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

// Draw 3 sets of high and low diagonal lines, equally spaced within the selected interval
const drawHighLowDiagonals = (chartData) => {
    const interval = parseInt(intervalSlider.value); // Use slider value for interval
    const dataLength = chartData.length;

    // Ensure there are enough data points
    if (dataLength < interval) {
        console.error('Not enough data to calculate highs and lows');
        return;
    }

    // Divide the interval into 3 equal blocks
    const blockSize = Math.floor(interval / 3);

    // Arrays to store significant highs and lows for each block
    const significantHighs = [];
    const significantLows = [];

    // Loop through each block to find significant highs and lows
    for (let i = 0; i < 3; i++) {
        const startIndex = dataLength - interval + i * blockSize;
        const endIndex = startIndex + blockSize;

        // Focus on the current block of data
        const blockData = chartData.slice(startIndex, endIndex);

        // Detect and exclude outliers
        const outliers = detectOutliers(blockData, 'close');
        const cleanData = blockData.filter(data => !outliers.includes(data));

        // Find significant highs and lows within this block
        const highs = findSignificantHighs(cleanData);
        const lows = findSignificantLows(cleanData);

        // Store the most significant high and low for this block
        if (highs.length > 0) {
            significantHighs.push(highs[0]); // Use the first significant high
        }
        if (lows.length > 0) {
            significantLows.push(lows[0]); // Use the first significant low
        }
    }

    // Draw diagonal lines connecting significant highs
    for (let i = 0; i < significantHighs.length - 1; i++) {
        const highLine = chart.addLineSeries({
            color: `rgba(255, 0, 0, ${0.8 - i * 0.2})`, // Different opacity for each line
            lineWidth: 2,
        });

        highLine.setData([
            { time: significantHighs[i].time, value: significantHighs[i].high },
            { time: significantHighs[i + 1].time, value: significantHighs[i + 1].high }
        ]);

        // Calculate the slope of the diagonal line
        const slope =
            (significantHighs[i + 1].high - significantHighs[i].high) /
            (significantHighs[i + 1].time - significantHighs[i].time);

        // Extend the line 3 months into the future (dotted line)
        const futureTime = significantHighs[i + 1].time + 90 * 86400; // 90 days in seconds
        const futureValue = significantHighs[i + 1].high + slope * (futureTime - significantHighs[i + 1].time);

        const projectionLine = chart.addLineSeries({
            color: `rgba(255, 0, 0, ${0.8 - i * 0.2})`,
            lineWidth: 1,
            lineStyle: LightweightCharts.LineStyle.Dotted,
        });

        projectionLine.setData([
            { time: significantHighs[i + 1].time, value: significantHighs[i + 1].high },
            { time: futureTime, value: futureValue }
        ]);

        highLines.push(highLine);
        highLines.push(projectionLine);
    }

    // Draw diagonal lines connecting significant lows
    for (let i = 0; i < significantLows.length - 1; i++) {
        const lowLine = chart.addLineSeries({
            color: `rgba(0, 255, 0, ${0.8 - i * 0.2})`, // Different opacity for each line
            lineWidth: 2,
        });

        lowLine.setData([
            { time: significantLows[i].time, value: significantLows[i].low },
            { time: significantLows[i + 1].time, value: significantLows[i + 1].low }
        ]);

        // Calculate the slope of the diagonal line
        const slope =
            (significantLows[i + 1].low - significantLows[i].low) /
            (significantLows[i + 1].time - significantLows[i].time);

        // Extend the line 3 months into the future (dotted line)
        const futureTime = significantLows[i + 1].time + 90 * 86400; // 90 days in seconds
        const futureValue = significantLows[i + 1].low + slope * (futureTime - significantLows[i + 1].time);

        const projectionLine = chart.addLineSeries({
            color: `rgba(0, 255, 0, ${0.8 - i * 0.2})`,
            lineWidth: 1,
            lineStyle: LightweightCharts.LineStyle.Dotted,
        });

        projectionLine.setData([
            { time: significantLows[i + 1].time, value: significantLows[i + 1].low },
            { time: futureTime, value: futureValue }
        ]);

        lowLines.push(lowLine);
        lowLines.push(projectionLine);
    }
};

// Helper function to find significant highs
const findSignificantHighs = (data) => {
    const significantHighs = [];
    for (let i = 1; i < data.length - 1; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const next = data[i + 1];

        // Check if the current high is a significant high
        if (curr.high > prev.high && curr.high > next.high) {
            significantHighs.push(curr);
        }
    }
    return significantHighs;
};

// Helper function to find significant lows
const findSignificantLows = (data) => {
    const significantLows = [];
    for (let i = 1; i < data.length - 1; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const next = data[i + 1];

        // Check if the current low is a significant low
        if (curr.low < prev.low && curr.low < next.low) {
            significantLows.push(curr);
        }
    }
    return significantLows;
};

// Initialize chart
createChart();

// Event listener for the button
fetchDataButton.addEventListener('click', () => {
    const pair = pairInput.value;
    const period = periodInput.value;
    fetchFXData(pair, period);
});

// Update slider value display
intervalSlider.addEventListener('input', () => {
    sliderValue.textContent = intervalSlider.value;
});

// Redraw chart when slider value changes
intervalSlider.addEventListener('change', () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;
    if (pair) {
        fetchFXData(pair, period);
    }
});

