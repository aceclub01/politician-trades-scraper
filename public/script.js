document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fetchDataButton = document.getElementById('fetchData');
    const fetchChartButton = document.getElementById('fetchChartData');
    const pairInput = document.getElementById('pair');
    const periodInput = document.getElementById('period');
    const intervalSlider = document.getElementById('intervalSlider');
    const sliderValue = document.getElementById('sliderValue');
    const historyBarsInput = document.getElementById('historyBars') || { value: 300 }; // Fallback value
    const resolutionInput = document.getElementById('resolution');
    const diagonalLinesInput = document.getElementById('diagonalLines');
    const alphaSlider = document.getElementById('alphaSlider');
    const alphaValue = document.getElementById('alphaValue');
    const chartDiv = document.getElementById('chart');
    let chart;
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

    // Create chart instance
    const createChart = () => {
        // Main chart for price data
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

        // Add histogram series for the MACD (background of the main chart)
        macdSeries = chart.addHistogramSeries({
            color: `rgba(38, 166, 154, ${alphaSlider.value})`, // Initial transparency
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'left', // Use a separate price scale for MACD
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
        // if (chartData[i].high === Math.max(...chartData.slice(i - x2, i + x2 + 1).map(d => d.high))) {
            if (chartData[i].close === Math.max(...chartData.slice(i - x2, i + x2 + 1).map(d => d.close))) {

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

        // Extend the line into the future based on months
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Current month (0-11)
        const currentYear = currentDate.getFullYear(); // Current year
        const lastBarDate = new Date(end.time * 1000); // Convert Unix time to JavaScript Date object
        const lastBarMonth = lastBarDate.getMonth();
        const lastBarYear = lastBarDate.getFullYear();

        // Calculate how many months to extend the line to
        const monthDifference = (currentYear - lastBarYear) * 12 + currentMonth - lastBarMonth;
        const futureTime = end.time + monthDifference * 30 * 24 * 60 * 60; // Approximate month in seconds
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

        // Extend the line into the future based on months
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Current month (0-11)
        const currentYear = currentDate.getFullYear(); // Current year
        const lastBarDate = new Date(end.time * 1000); // Convert Unix time to JavaScript Date object
        const lastBarMonth = lastBarDate.getMonth();
        const lastBarYear = lastBarDate.getFullYear();

        // Calculate how many months to extend the line to
        const monthDifference = (currentYear - lastBarYear) * 12 + currentMonth - lastBarMonth;
        const futureTime = end.time + monthDifference * 30 * 24 * 60 * 60; // Approximate month in seconds
        const futureValue = priceAt(start.time, start.value, end.time, end.value, futureTime);

        line.setData([
            { time: start.time, value: start.value },
            { time: end.time, value: end.value },
            { time: futureTime, value: futureValue },
        ]);

        resistances.push(line);
    }
};

    // Function to draw Fibonacci levels
    const drawFibonacci = (chartData) => {
        const filteredData = filterOutliers(chartData); // Apply outlier filtering
        const closePrices = filteredData.map(d => d.close); // Use closing prices
        const minPrice = Math.min(...closePrices);
        const maxPrice = Math.max(...closePrices);
    
        const fibonacciLevels = [0.0, 0.236, 0.382, 0.5, 0.618, 1.0];
        const fibonacciLinesArr = fibonacciLevels.map(level => ({
            price: minPrice + (maxPrice - minPrice) * level,
            label: `${(level * 100).toFixed(1)}%`
        }));
    
        fibonacciLinesArr.forEach(level => {
            const fibLine = chart.addLineSeries({
                color: 'rgba(93, 98, 98, 0.59)', // Cyan for Fibonacci levels
                lineWidth: 2,
            });
    
            // Draw the line across the chart time range
            fibLine.setData([
                { time: filteredData[0].time, value: level.price },
                { time: filteredData[filteredData.length - 1].time, value: level.price }
            ]);
    
            fibonacciLines.push(fibLine);
        });
    };

    // Function to draw Elliott Waves
    const drawElliotWave = (chartData) => {
        const filteredData = filterOutliers(chartData); // Apply outlier filtering
        const closePrices = filteredData.map(d => d.close); // Use closing prices
    
        if (closePrices.length < 5) return; // Ensure we have enough data for waves
    
        const points = [
            { time: filteredData[0].time, value: closePrices[0] }, // Wave 1
            { time: filteredData[Math.floor(filteredData.length * 0.25)].time, value: closePrices[Math.floor(closePrices.length * 0.25)] }, // Wave 2
            { time: filteredData[Math.floor(filteredData.length * 0.5)].time, value: closePrices[Math.floor(closePrices.length * 0.5)] }, // Wave 3
            { time: filteredData[Math.floor(filteredData.length * 0.75)].time, value: closePrices[Math.floor(closePrices.length * 0.75)] }, // Wave 4
            { time: filteredData[filteredData.length - 1].time, value: closePrices[closePrices.length - 1] }, // Wave 5
        ];
    
        points.forEach((point, index) => {
            if (index < points.length - 1) {
                const line = chart.addLineSeries({
                    color: 'rgba(255, 165, 0, 0.8)', // Orange for Elliott Waves
                    lineWidth: 2,
                });
    
                // Set data for Elliot Wave lines
                line.setData([
                    { time: point.time, value: point.value },
                    { time: points[index + 1].time, value: points[index + 1].value }
                ]);
    
                elliotLines.push(line);
            }
        });
    };
    const filterOutliers = (data, threshold = 0.1) => {
        const closePrices = data.map(d => d.close);
        const average = closePrices.reduce((sum, price) => sum + price, 0) / closePrices.length;
    
        return data.filter(d => {
            const deviation = Math.abs(d.close - average) / average;
            return deviation <= threshold;
        });
    };
    // Function to get significant highs and lows over the last 6 months
    const getSignificantHighLow = (chartData, sixMonthsAgo) => {
        const allData = chartData; // Entire chart data
        const recentData = chartData.filter(data => data.time >= sixMonthsAgo); // Recent 6 months data
    
        if (allData.length === 0 || recentData.length === 0) return null;
    
        // Find two significant highs using closing prices (entire chart)
        const allHighs = allData
            .map(data => ({ time: data.time, value: data.close })) // Use closing prices
            .sort((a, b) => b.value - a.value); // Sort descending by value
    
        const significantAllHighs = [];
        for (let i = 0; i < allHighs.length; i++) {
            if (significantAllHighs.length === 0) {
                significantAllHighs.push(allHighs[i]);
            } else if (Math.abs(allHighs[i].time - significantAllHighs[0].time) >= 30 * 24 * 60 * 60) { // At least 1 month apart
                significantAllHighs.push(allHighs[i]);
                break;
            }
        }
    
        // Find two significant lows using closing prices (entire chart)
        const allLows = allData
            .map(data => ({ time: data.time, value: data.close })) // Use closing prices
            .sort((a, b) => a.value - b.value); // Sort ascending by value
    
        const significantAllLows = [];
        for (let i = 0; i < allLows.length; i++) {
            if (significantAllLows.length === 0) {
                significantAllLows.push(allLows[i]);
            } else if (Math.abs(allLows[i].time - significantAllLows[0].time) >= 30 * 24 * 60 * 60) { // At least 1 month apart
                significantAllLows.push(allLows[i]);
                break;
            }
        }
    
        // Find two significant highs using closing prices (recent 6 months)
        const recentHighs = recentData
            .map(data => ({ time: data.time, value: data.close })) // Use closing prices
            .sort((a, b) => b.value - a.value); // Sort descending by value
    
        const significantRecentHighs = [];
        for (let i = 0; i < recentHighs.length; i++) {
            if (significantRecentHighs.length === 0) {
                significantRecentHighs.push(recentHighs[i]);
            } else if (Math.abs(recentHighs[i].time - significantRecentHighs[0].time) >= 30 * 24 * 60 * 60) { // At least 1 month apart
                significantRecentHighs.push(recentHighs[i]);
                break;
            }
        }
    
        // Find two significant lows using closing prices (recent 6 months)
        const recentLows = recentData
            .map(data => ({ time: data.time, value: data.close })) // Use closing prices
            .sort((a, b) => a.value - b.value); // Sort ascending by value
    
        const significantRecentLows = [];
        for (let i = 0; i < recentLows.length; i++) {
            if (significantRecentLows.length === 0) {
                significantRecentLows.push(recentLows[i]);
            } else if (Math.abs(recentLows[i].time - significantRecentLows[0].time) >= 30 * 24 * 60 * 60) { // At least 1 month apart
                significantRecentLows.push(recentLows[i]);
                break;
            }
        }
    
        return {
            allHighs: significantAllHighs,
            allLows: significantAllLows,
            recentHighs: significantRecentHighs,
            recentLows: significantRecentLows,
        };
    };

    // Function to draw diagonal lines for significant highs and lows
    const drawDiagonalLines = (chartData) => {
        const sixMonthsAgo = Date.now() / 1000 - 6 * 30 * 24 * 60 * 60; // 6 months ago in seconds
        const significantPoints = getSignificantHighLow(chartData, sixMonthsAgo);
    
        if (!significantPoints) return;
    
        const { allHighs, allLows, recentHighs, recentLows } = significantPoints;
    
        // Draw diagonal lines for significant highs (far end to near term)
        if (allHighs.length >= 1 && recentHighs.length >= 1) {
            const highLine = chart.addLineSeries({
                color: 'rgba(255, 0, 0, 0.8)', // Red for significant highs
                lineWidth: 2,
            });
    
            const highFutureTime = recentHighs[0].time + 3 * 30 * 24 * 60 * 60; // 3 months in seconds
            const highFutureValue = priceAt(allHighs[0].time, allHighs[0].value, recentHighs[0].time, recentHighs[0].value, highFutureTime);
    
            highLine.setData([
                { time: allHighs[0].time, value: allHighs[0].value },
                { time: recentHighs[0].time, value: recentHighs[0].value },
                { time: highFutureTime, value: highFutureValue },
            ]);
    
            resistances.push(highLine);
        }
    
        // Draw diagonal lines for significant lows (far end to near term)
        if (allLows.length >= 1 && recentLows.length >= 1) {
            const lowLine = chart.addLineSeries({
                color: 'rgba(0, 123, 255, 0.98)', // Green for significant lows
                lineWidth: 2,
            });
    
            const lowFutureTime = recentLows[0].time + 3 * 30 * 24 * 60 * 60; // 3 months in seconds
            const lowFutureValue = priceAt(allLows[0].time, allLows[0].value, recentLows[0].time, recentLows[0].value, lowFutureTime);
    
            lowLine.setData([
                { time: allLows[0].time, value: allLows[0].value },
                { time: recentLows[0].time, value: recentLows[0].value },
                { time: lowFutureTime, value: lowFutureValue },
            ]);
    
            supports.push(lowLine);
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
    
            // Log the raw data fetched from the API
            console.log('Raw data fetched:', data);
    
            // Prepare data for chart with null handling
            let chartData = data.chart.result[0].timestamp.map((timestamp, index) => ({
                time: timestamp,
                open: handleNullValue(data, index, 'open'),
                high: handleNullValue(data, index, 'high'),
                low: handleNullValue(data, index, 'low'),
                close: handleNullValue(data, index, 'close'),
            }));
    
            // Log the processed chart data (after handling null values)
            console.log('Processed chart data:', chartData);
    
            // Filter outliers based on closing prices
            chartData = filterOutliers(chartData);
    
            // Log the chart data after filtering outliers
            console.log('Chart data after filtering outliers:', chartData);
    
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
    
            // Calculate MACD values
            const closePrices = chartData.map(d => d.close);
            const { macd, signal, histogram } = calculateMACD(closePrices);
    
            // Plot MACD histogram (background of the main chart)
            const macdData = chartData.map((d, i) => ({
                time: d.time,
                value: histogram[i],
                color: histogram[i] >= 0 ? `rgba(38, 166, 154, ${alphaSlider.value})` : `rgba(239, 83, 80, ${alphaSlider.value})`, // Dynamic transparency
            }));
            macdSeries.setData(macdData);
    
            // Calculate and plot SMAs
            const sma7 = calculateSMA(chartData, 7);
            const sma20 = calculateSMA(chartData, 20);
            const sma50 = calculateSMA(chartData, 50);
    
            sma7Series = chart.addLineSeries({ color: 'rgba(255, 0, 0, 0.8)', lineWidth: 1 }); // Red for SMA 7
            sma7Series.setData(sma7);
    
            sma20Series = chart.addLineSeries({ color: 'rgba(0, 255, 0, 0.8)', lineWidth: 1 }); // Green for SMA 20
            sma20Series.setData(sma20);
    
            sma50Series = chart.addLineSeries({ color: 'rgba(0, 0, 255, 0.8)', lineWidth: 1 }); // Blue for SMA 50
            sma50Series.setData(sma50);
    
            // Draw support and resistance lines
            drawSupportResistance(chartData);
    
            // Draw Fibonacci levels
            drawFibonacci(chartData);
    
            // Draw Elliott Waves
            drawElliotWave(chartData);
    
            // Draw diagonal lines for significant highs and lows
            drawDiagonalLines(chartData);
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
});