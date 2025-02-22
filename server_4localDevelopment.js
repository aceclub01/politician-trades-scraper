const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Your FMP API key (for fundamentals)
const FMP_API_KEY = 'dJUE3rYqnvX5i2kg0TN7b3XxsVMuOdO5'; // Replace with your FMP API key

// Your NewsAPI key
const NEWS_API_KEY = 'a791888a5f4b4ee0b87a5c40e4b16dcf'; // Replace with your NewsAPI key

// Existing FX data endpoint (unchanged)
app.get('/fxdata', async (req, res) => {
    const { pair, period } = req.query; // Example: pair=USDSGD=X, period=1mo
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=${period}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FX data' });
    }
});

// Endpoint for fetching fundamentals using FMP
// Endpoint for fetching fundamentals using FMP
async function fetchFundamentals(symbol) {
    try {
        const response = await fetch(`http://localhost:3000/fetchFundamentals?symbol=${symbol}`);
        const data = await response.json();

        // Debugging: Log the entire data object to the console
        console.log('API Response Data:', data);

        // Check if the symbol is an FX pair
        if (symbol.includes('=X')) {
            document.getElementById('marketCap').textContent = 'N/A (FX Pair)';
            document.getElementById('targetPE').textContent = 'N/A (FX Pair)';
            document.getElementById('eps').textContent = 'N/A (FX Pair)';
            document.getElementById('oneYearTargetEst').textContent = 'N/A (FX Pair)';
            document.getElementById('exDividendDate').textContent = 'N/A (FX Pair)';
            document.getElementById('earningsDate').textContent = 'N/A (FX Pair)';
            document.getElementById('fiftyTwoWeekRange').textContent = 'N/A (FX Pair)';
            return;
        }

        // Handle stock data
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or missing data from Financial Modeling Prep');
        }

        const fundamentals = data[0];

        // Debugging: Log the fundamentals object to the console
        console.log('Fundamentals Data:', fundamentals);

        // Extract and display relevant fields
        const {
            marketCap,
            price,
            beta,
            lastDiv,
            range,
            companyName,
            exchange,
            industry,
            website,
            description,
            ceo,
            sector,
            image
        } = fundamentals;

        document.getElementById('marketCap').textContent = marketCap ? `$${marketCap.toLocaleString()}` : 'N/A';
        document.getElementById('targetPE').textContent = beta || 'N/A';
        document.getElementById('eps').textContent = price || 'N/A';
        document.getElementById('oneYearTargetEst').textContent = range || 'N/A';
        document.getElementById('exDividendDate').textContent = lastDiv || 'N/A';
        document.getElementById('earningsDate').textContent = range || 'N/A';
        document.getElementById('fiftyTwoWeekRange').textContent = range || 'N/A';

        // Debugging: Log all available fields in the fundamentals object
        console.log('Available Fields in Fundamentals:', Object.keys(fundamentals));
    } catch (error) {
        console.error('Error fetching fundamentals:', error);
        document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}
// Endpoint for fetching news using NewsAPI
app.get('/fetchNews', async (req, res) => {
    const { symbol, limit } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const url = `https://newsapi.org/v2/everything?q=${symbol}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
        const response = await axios.get(url);

        // Check if the API returned an error
        if (response.data.status !== 'ok') {
            throw new Error(response.data.message || 'Failed to fetch news');
        }

        res.json(response.data.articles);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: error.message || 'Failed to fetch news' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));