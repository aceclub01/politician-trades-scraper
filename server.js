const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const FMP_API_KEY = process.env.FMP_API_KEY;

// Serve static files from the "public" directory
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));

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

// Endpoint for fetching quote data
app.get('/fetchQuote', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/quote-order/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching quote data:', error.message);
        res.status(500).json({ error: 'Failed to fetch quote data' });
    }
});

// Endpoint for fetching FX data
app.get('/fxdata', async (req, res) => {
    const { pair, period } = req.query;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=${period}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching FX data:', error.message);
        res.status(500).json({ error: 'Failed to fetch FX data' });
    }
});

// Endpoint for fetching fundamentals
app.get('/fetchFundamentals', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        const fundamentals = data[0];
        const exDividendDate = fundamentals.lastDiv ? new Date(fundamentals.lastDiv * 1000).toLocaleDateString() : 'N/A';

        res.json([{ ...fundamentals, exDividendDate }]);
    } catch (error) {
        console.error('Error fetching fundamentals:', error.message);
        res.status(500).json({ error: 'Failed to fetch fundamentals' });
    }
});

// Endpoint for fetching key statistics
app.get('/fetchKeyStatistics', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching key statistics:', error.message);
        res.status(500).json({ error: 'Failed to fetch key statistics' });
    }
});

// Endpoint for fetching income statement
app.get('/fetchIncomeStatement', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching income statement:', error.message);
        res.status(500).json({ error: 'Failed to fetch income statement' });
    }
});

// Endpoint for fetching financial growth data
app.get('/fetchFinancialGrowth', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?period=annual&apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching financial growth data:', error.message);
        res.status(500).json({ error: 'Failed to fetch financial growth data' });
    }
});

// Endpoint for fetching earnings date
app.get('/fetchEarningsDate', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/earning_calendar/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching earnings date:', error.message);
        res.status(500).json({ error: 'Failed to fetch earnings date' });
    }
});

// Endpoint for fetching cash flow statement growth data
app.get('/fetchCashFlowGrowth', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/cash-flow-statement-growth/${symbol}?period=annual&apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching cash flow growth data:', error.message);
        res.status(500).json({ error: 'Failed to fetch cash flow growth data' });
    }
});


// Endpoint for fetching income statement growth data
app.get('/fetchIncomeStatementGrowth', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/income-statement-growth/${symbol}?period=annual&apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching income statement growth data:', error.message);
        res.status(500).json({ error: 'Failed to fetch income statement growth data' });
    }
});

// Endpoint for fetching balance sheet statement growth data
app.get('/fetchBalanceSheetGrowth', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement-growth/${symbol}?period=annual&apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching balance sheet growth data:', error.message);
        res.status(500).json({ error: 'Failed to fetch balance sheet growth data' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));