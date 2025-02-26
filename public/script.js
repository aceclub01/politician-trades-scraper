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
const alphaSlider = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const chartDiv = document.getElementById('chart');

// Chart Instances
let chart, macdChart;
let lineSeries = null, macdSeries = null;
let sma7Series = null, sma20Series = null, sma50Series = null;
let supports = [], resistances = [], fibonacciLines = [], elliotLines = [];

// Constants
const API_URL = 'https://politician-trades-scraper.onrender.com/fxdata';
const MACD_COLORS = {
    positive: 'rgba(38, 166, 154, 1)',
    negative: 'rgba(239, 83, 80, 1)',
};
const SMA_COLORS = {
    sma7: 'rgba(255, 0, 0, 0.8)',
    sma20: 'rgba(0, 255, 0, 0.8)',
    sma50: 'rgba(0, 0, 255, 0.8)',
};

// Initialize Sliders
intervalSlider.addEventListener('input', () => {
    sliderValue.textContent = intervalSlider.value;
});

alphaSlider.addEventListener('input', () => {
    alphaValue.textContent = alphaSlider.value;
    updateMACDTransparency();
});

// Update Resolution Based on History Bars
historyBarsInput.addEventListener('input', () => {
    const historyBars = parseInt(historyBarsInput.value, 10);
    resolutionInput.value = Math.round(historyBars / 5);
});

// Create Chart Instances
const createCharts = () => {
    // Main Price Chart
    chart = LightweightCharts.createChart(chartDiv, {
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight * 0.7,
        layout: { backgroundColor: '#ffffff', textColor: '#000000' },
        grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        priceScale: { position: 'right', borderColor: '#cccccc' },
        timeScale: { borderColor: '#cccccc' },
    });

    // MACD Chart
    const macdChartDiv = document.createElement('div');
    macdChartDiv.style.height = `${chartDiv.clientHeight * 0.3}px`;
    chartDiv.appendChild(macdChartDiv);

    macdChart = LightweightCharts.createChart(macdChartDiv, {
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight * 0.3,
        layout: { backgroundColor: '#ffffff', textColor: '#000000' },
        grid: { vertLines: { color: '#eeeeee' }, horzLines: { color: '#eeeeee' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        priceScale: { position: 'right', borderColor: '#cccccc' },
        timeScale: { borderColor: '#cccccc' },
    });

    // Initialize Series
    lineSeries = chart.addCandlestickSeries({ priceScaleId: 'right' });
    macdSeries = macdChart.addHistogramSeries({
        color: MACD_COLORS.positive,
        priceFormat: { type: 'volume' },
    });

    console.log('Charts initialized:', chart, macdChart);
};

// Update MACD Transparency
const updateMACDTransparency = () => {
    const alpha = alphaSlider.value;
    macdSeries.applyOptions({
        color: MACD_COLORS.positive.replace('1)', `${alpha})`),
    });
};

// Calculate SMA
const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
};

// Calculate MACD
const calculateMACD = (data, fastLength = 12, slowLength = 26, signalLength = 9) => {
    const fastEMA = calculateEMA(data, fastLength);
    const slowEMA = calculateEMA(data, slowLength);
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signal = calculateEMA(macd, signalLength);
    const histogram = macd.map((macdVal, i) => macdVal - signal[i]);
    return { macd, signal, histogram };
};

// Calculate EMA
const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
};

// Handle Null Values
const handleNullValue = (data, index, field) => {
    const quote = data.chart.result[0].indicators.quote[0][field];
    let value = quote[index];

    if (value === null) {
        for (let i = index - 1; i >= 0; i--) {
            if (quote[i] !== null) return quote[i];
        }
        for (let i = index + 1; i < quote.length; i++) {
            if (quote[i] !== null) return quote[i];
        }
        return 0; // Default fallback
    }
    return value;
};

// Clear All Lines
const clearLines = () => {
    [supports, resistances, fibonacciLines, elliotLines].forEach(lines => {
        lines.forEach(line => chart.removeSeries(line));
        lines.length = 0;
    });
    [sma7Series, sma20Series, sma50Series].forEach(series => {
        if (series) chart.removeSeries(series);
    });
};

// Fetch and Update Chart
const fetchAndUpdateChart = async (pair, period) => {
    try {
        const response = await fetch(`${API_URL}?pair=${pair}&period=${period}`);
        const data = await response.json();

        if (data.error) {
            alert('Failed to fetch data');
            return;
        }

        const chartData = data.chart.result[0].timestamp.map((timestamp, index) => ({
            time: timestamp,
            open: handleNullValue(data, index, 'open'),
            high: handleNullValue(data, index, 'high'),
            low: handleNullValue(data, index, 'low'),
            close: handleNullValue(data, index, 'close'),
        }));

        clearLines();

        lineSeries.setData(chartData);

        const closePrices = chartData.map(d => d.close);
        const { histogram } = calculateMACD(closePrices);

        const macdData = chartData.map((d, i) => ({
            time: d.time,
            value: histogram[i],
            color: histogram[i] >= 0 ? MACD_COLORS.positive : MACD_COLORS.negative,
        }));
        macdSeries.setData(macdData);

        const sma7 = calculateSMA(chartData, 7);
        const sma20 = calculateSMA(chartData, 20);
        const sma50 = calculateSMA(chartData, 50);

        sma7Series = chart.addLineSeries({ color: SMA_COLORS.sma7, lineWidth: 1 });
        sma7Series.setData(sma7);

        sma20Series = chart.addLineSeries({ color: SMA_COLORS.sma20, lineWidth: 1 });
        sma20Series.setData(sma20);

        sma50Series = chart.addLineSeries({ color: SMA_COLORS.sma50, lineWidth: 1 });
        sma50Series.setData(sma50);

        drawSupportResistance(chartData);
        updateChartWithIndicators(chartData);
    } catch (error) {
        console.error('Error fetching FX data:', error);
        alert('Failed to fetch FX data. Check the console for details.');
    }
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

// Function to calculate price at a specific time
const priceAt = (t1, p1, t2, p2, t3) => {
    return p1 + (p2 - p1) * (t3 - t1) / (t2 - t1);
};

// Event Listeners
fetchDataButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;
    await fetchAndUpdateChart(pair, period);
});

fetchChartButton.addEventListener('click', async () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value;
    await fetchAndUpdateChart(pair, period);
});

// Initialize Charts
createCharts();