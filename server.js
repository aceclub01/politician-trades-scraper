const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Load environment variables
const FMP_API_KEY = process.env.FMP_API_KEY; // Financial Modeling Prep API key
const NEWS_API_KEY = process.env.NEWS_API_KEY; // NewsAPI key

// Serve static files (if any)
app.use(express.static('public'));

// Endpoint for fetching FX data from Yahoo Finance
app.get('/fxdata', async (req, res) => {
    const { pair, period } = req.query; // Example: pair=USDSGD=X, period=1mo
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=${period}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching FX data:', error.message);
        res.status(500).json({ error: 'Failed to fetch FX data' });
    }
});

// Endpoint for fetching stock fundamentals using FMP
app.get('/fetchFundamentals', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // Check if the symbol is an FX pair
    if (symbol.includes('=X')) {
        return res.json([{
            symbol,
            message: 'Fundamentals not available for FX pairs.'
        }]);
    }

    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);

        // Check if the response is valid
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching fundamentals:', error.message);
        res.status(500).json({ error: 'Failed to fetch fundamentals' });
    }
});

// Endpoint for fetching key statistics using FMP
app.get('/fetchKeyStatistics', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // Check if the symbol is an FX pair
    if (symbol.includes('=X')) {
        return res.json([{
            symbol,
            message: 'Key statistics not available for FX pairs.'
        }]);
    }

    const url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);

        // Check if the response is valid
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching key statistics:', error.message);
        res.status(500).json({ error: 'Failed to fetch key statistics' });
    }
});

// Endpoint for fetching income statement data using FMP
app.get('/fetchIncomeStatement', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // Check if the symbol is an FX pair
    if (symbol.includes('=X')) {
        return res.json([{
            symbol,
            message: 'Income statement not available for FX pairs.'
        }]);
    }

    const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);

        // Check if the response is valid
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching income statement:', error.message);
        res.status(500).json({ error: 'Failed to fetch income statement' });
    }
});

// Endpoint for fetching dividend data using FMP
app.get('/fetchDividendData', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // Check if the symbol is an FX pair
    if (symbol.includes('=X')) {
        return res.json([{
            symbol,
            message: 'Dividend data not available for FX pairs.'
        }]);
    }

    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);

        // Check if the response is valid
        if (!response.data.historical || response.data.historical.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching dividend data:', error.message);
        res.status(500).json({ error: 'Failed to fetch dividend data' });
    }
});

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
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));