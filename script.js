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

// Fetch FX data with a new function name to prevent conflicts
const fetchFXDataForChart = async (pair, period) => {
    try {
        //const response = await fetch(`http://localhost:3000/fxdata?pair=${pair}&period=${period}`);
        const response = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);

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

// Other functions remain the same (handleNullValue, preventExtremeSpikes, etc.)
// Use them as is

// Draw Diagonal Fibonacci retracement lines (ignoring outliers)
const drawDiagonalFibonacci = (chartData) => {
    const outliers = detectOutliers(chartData, 'close');
    const cleanData = chartData.filter(data => !outliers.includes(data));

    const minPrice = Math.min(...cleanData.map(data => data.low));
    const maxPrice = Math.max(...cleanData.map(data => data.high));

    const fibonacciLevels = [0.0, 0.236, 0.382, 0.5, 0.618, 1.0];
    const startTime = cleanData[0].time;
    const endTime = cleanData[cleanData.length - 1].time;

    const priceDiff = maxPrice - minPrice;

    fibonacciLevels.forEach(level => {
        const priceLevel = minPrice + priceDiff * level;

        const fibLine = chart.addLineSeries({
            color: 'rgba(0, 255, 255, 0.8)',
            lineWidth: 2,
            crosshairMarkerVisible: true,
        });

        fibLine.setData([
            { time: startTime, value: priceLevel },
            { time: endTime, value: priceLevel }
        ]);

        fibonacciLines.push(fibLine);
    });
};

// Modify this code block to handle the conflict more cleanly:
const fetchDataButtonHandler = async () => {
    const pair = pairInput.value;
    const period = periodInput.value;
    await fetchFXDataForChart(pair, period);
};

// Attach the handler to the button
fetchDataButton.addEventListener('click', fetchDataButtonHandler);
