const fetchDataButton = document.getElementById('fetchData');
const fetchChartButton = document.getElementById('fetchChartData'); 
const pairInput = document.getElementById('pair');
const periodInput = document.getElementById('period');
const fibonacciInput = document.getElementById('fibonacci');
const elliotInput = document.getElementById('elliot');
const chartDiv = document.getElementById('chart');
let chart;
let lineSeries;
let fibonacciLines = [];
let elliotLines = [];

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
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        priceScale: { borderColor: '#cccccc' },
        timeScale: { borderColor: '#cccccc' },
    });

    lineSeries = chart.addCandlestickSeries();
    console.log('Chart initialized:', chart);
};

const handleNullValue = (data, index, field) => {
    let value = data.chart.result[0].indicators.quote[0][field][index];
    if (value === null) {
        for (let i = index - 1; i >= 0; i--) {
            if (data.chart.result[0].indicators.quote[0][field][i] !== null) return data.chart.result[0].indicators.quote[0][field][i];
        }
        for (let i = index + 1; i < data.chart.result[0].timestamp.length; i++) {
            if (data.chart.result[0].indicators.quote[0][field][i] !== null) return data.chart.result[0].indicators.quote[0][field][i];
        }
        return 0;
    }
    return value;
};

const connectExtremePoints = (points, type) => {
    if (points.length < 2) return [];

    const connections = [];

    // Connect from the first significant point to the most recent high/low
    connections.push([points[0], points[points.length - 1]]);

    // Then connect recent extremes to next far points while skipping close ones
    for (let i = points.length - 1; i > 0; i--) {
        const recent = points[i];
        for (let j = i - 2; j >= 0; j--) {
            const far = points[j];
            const timeGap = Math.abs(recent.time - far.time);
            const valueGap = Math.abs(recent.value - far.value);

            if (timeGap > 7 * 24 * 60 * 60 && valueGap > 0.01) { // 1-week time gap & minimal price gap
                connections.push([far, recent]);
                break;
            }
        }
    }
    return connections;
};

const drawDiagonalTrendlines = (chartData) => {
    if (chartData.length < 2) return;

    const swingHighs = [], swingLows = [];

    for (let i = 1; i < chartData.length - 1; i++) {
        if (chartData[i].high > chartData[i - 1].high && chartData[i].high > chartData[i + 1].high) 
            swingHighs.push({ time: chartData[i].time, value: chartData[i].high });
        
        if (chartData[i].low < chartData[i - 1].low && chartData[i].low < chartData[i + 1].low) 
            swingLows.push({ time: chartData[i].time, value: chartData[i].low });
    }

    const highConnections = connectExtremePoints(swingHighs, 'high');
    const lowConnections = connectExtremePoints(swingLows, 'low');

    const drawLines = (connections, color) => {
        connections.forEach(([start, end]) => {
            const line = chart.addLineSeries({ color, lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Solid });
            const futureTime = end.time + 90 * 24 * 60 * 60; // 3 months extension
            line.setData([
                { time: start.time, value: start.value },
                { time: end.time, value: end.value },
                { time: futureTime, value: end.value + ((end.value - start.value) / (end.time - start.time)) * (futureTime - end.time) },
            ]);
        });
    };

    drawLines(highConnections, 'rgba(255, 0, 0, 0.8)'); // Red lines for highs
    drawLines(lowConnections, 'rgba(0, 255, 0, 0.8)'); // Green lines for lows
};

const fetchAndUpdateChart = async (pair, period) => {
    try {
        console.log(`Fetching chart data for pair: ${pair}, period: ${period}`);
        const response = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);
        const data = await response.json();

        if (data.error) return alert('Failed to fetch data');

        const chartData = data.chart.result[0].timestamp.map((timestamp, index) => ({
            time: timestamp,
            open: handleNullValue(data, index, 'open'),
            high: handleNullValue(data, index, 'high'),
            low: handleNullValue(data, index, 'low'),
            close: handleNullValue(data, index, 'close'),
        }));

        chart.removeSeries(lineSeries);
        lineSeries = chart.addCandlestickSeries();
        lineSeries.setData(chartData);

        drawDiagonalTrendlines(chartData);

    } catch (error) {
        console.error('Error fetching FX data:', error);
        alert('Failed to fetch FX data. Check console.');
    }
};

fetchChartButton.addEventListener('click', () => {
    const pair = pairInput.value.trim();
    const period = periodInput.value.trim();
    if (pair && period) fetchAndUpdateChart(pair, period);
});

fetchDataButton.addEventListener('click', createChart);
