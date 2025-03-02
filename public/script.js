document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const fetchDataButton = document.getElementById('fetchData');
    const pairInput = document.getElementById('pair');
    const periodInput = document.getElementById('period');
    const fibonacciInput = document.getElementById('fibonacci');
    const elliotInput = document.getElementById('elliot');
    const intervalSlider = document.getElementById('intervalSlider');
    const sliderValue = document.getElementById('sliderValue');
    const chartDiv = document.getElementById('chart');

    // Check if all required elements exist
    if (!fetchDataButton || !pairInput || !periodInput || !fibonacciInput || !elliotInput || !intervalSlider || !sliderValue || !chartDiv) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

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

    // Initialize chart
    createChart();

    // Read the stock ticker from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const stockTicker = urlParams.get('stock');

    // If a stock ticker is provided in the URL, set it in the input field and fetch data
    if (stockTicker) {
        pairInput.value = stockTicker;
        fetchFXData(stockTicker, periodInput.value); // Automatically fetch and display data
    }

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

    // Fetch FX data from the server
    const fetchFXData = async (pair, period) => {
        try {
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

    // Other functions (handleNullValue, preventExtremeSpikes, etc.) remain unchanged
});