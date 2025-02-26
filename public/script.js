document.addEventListener('DOMContentLoaded', () => {
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
    let chart;
    let macdChart;
    let lineSeries = null;
    let macdSeries = null;
    let sma7Series = null;
    let sma20Series = null;
    let sma50Series = null;
    let supports = [];
    let resistances = [];
    let fibonacciLines = [];
    let elliotLines = [];

    // Initialize slider value display
    intervalSlider.addEventListener('input', () => {
        sliderValue.textContent = intervalSlider.value;
    });

    // Initialize alpha slider value display
    alphaSlider.addEventListener('input', () => {
        alphaValue.textContent = alphaSlider.value;
        updateMACDTransparency();
    });

    // Update resolution based on history bars
    const updateResolution = () => {
        const historyBars = parseInt(historyBarsInput.value, 10);
        resolutionInput.value = Math.round(historyBars / 5);
    };

    historyBarsInput.addEventListener('input', updateResolution);

    // Create chart instances
    const createCharts = () => {
        // Main chart for price data
        chart = LightweightCharts.createChart(chartDiv, {
            width: chartDiv.clientWidth,
            height: chartDiv.clientHeight * 0.7, // 70% height for main chart
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
                position: 'right',
                borderColor: '#cccccc',
            },
            timeScale: {
                borderColor: '#cccccc',
            },
        });

        // Add candlestick series for the price chart
        lineSeries = chart.addCandlestickSeries({
            priceScaleId: 'right',
        });

        console.log('Chart initialized:', chart);
    };

    // Update MACD histogram transparency
    const updateMACDTransparency = () => {
        const alpha = alphaSlider.value;
        if (macdSeries) {
            macdSeries.applyOptions({
                color: `rgba(38, 166, 154, ${alpha})`, // Update transparency
            });
        }
    };

    // Function to calculate SMA
    const calculateSMA = (data, period) => {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
            sma.push({ time: data[i].time, value: sum / period });
        }
        return sma;
    };

    // Function to calculate price at a specific time
    const priceAt = (t1, p1, t2, p2, t3) => {
        return p1 + (p2 - p1) * (t3 - t1) / (t2 - t1);
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

        // Draw support lines (connecting lows)
        for (let i = 0; i < Math.min(minimums.length - 1, diagonalLines); i++) {
            const start = minimums[i];
            const end = minimums[i + 1];

            const line = chart.addLineSeries({
                color: 'rgba(23, 255, 39, 0.5)', // Green for support
                lineWidth: 2,
            });

            // Extend the line into the future (3 months beyond today)
            const futureTime = end.time + 90 * 24 * 60 * 60; // 90 days in seconds
            const futureValue = priceAt(start.time, start.value, end.time, end.value, futureTime);

            line.setData([
                { time: start.time, value: start.value },
                { time: end.time, value: end.value },
                { time: futureTime, value: futureValue },
            ]);

            supports.push(line);
        }

        // Draw resistance lines (connecting highs)
        for (let i = 0; i < Math.min(maximums.length - 1, diagonalLines); i++) {
            const start = maximums[i];
            const end = maximums[i + 1];

            const line = chart.addLineSeries({
                color: 'rgba(255, 119, 173, 0.5)', // Pink for resistance
                lineWidth: 2,
            });

            // Extend the line into the future (3 months beyond today)
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

    // Function to clear all lines
    const clearLines = () => {
        supports.forEach(line => chart.removeSeries(line));
        resistances.forEach(line => chart.removeSeries(line));
        fibonacciLines.forEach(line => chart.removeSeries(line));
        elliotLines.forEach(line => chart.removeSeries(line));
        if (sma7Series) chart.removeSeries(sma7Series);
        if (sma20Series) chart.removeSeries(sma20Series);
        if (sma50Series) chart.removeSeries(sma50Series);
        supports = [];
        resistances = [];
        fibonacciLines = [];
        elliotLines = [];
        sma7Series = null;
        sma20Series = null;
        sma50Series = null;
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
            clearLines(); // Clear existing lines
    
            // Add new candlestick series
            lineSeries = chart.addCandlestickSeries({
                priceScaleId: 'right',
            });
            lineSeries.setData(chartData);
    
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
    createCharts();
});