const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Your FMP API key (for fundamentals)
const FMP_API_KEY = process.env.FMP_API_KEY;
// Your NewsAPI key
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Enable CORS for your frontend domain
app.use(cors({
    origin: 'https://politician-trades-scraper.onrender.com', // Replace with your frontend URL
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true // Allow cookies and credentials
}));

// Serve index.html with the stock ticker from the query parameter
app.get('/', (req, res) => {
    const stockTicker = req.query.stock || ''; // Get the stock ticker from the URL query parameter
    res.sendFile(path.join(__dirname, 'public', 'index.html'), { stockTicker });
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

app.get('/fetchfinancialgrowth', async (req, res) => {
    const { symbol } = req.query;
    const url = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?apikey=${FMP_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching key statistics:', error.message);
        res.status(500).json({ error: 'Failed to fetch key financial growth data' });
    }
});

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
// app.get('/fetchIncomeStatement', async (req, res) => {
//     const { symbol } = req.query;
//     const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${FMP_API_KEY}`;

//     try {
//         const response = await axios.get(url);
//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching income statement:', error.message);
//         res.status(500).json({ error: 'Failed to fetch income statement' });
//     }
// });
app.get('/fetchIncomeStatement', async (req, res) => {
    const { symbol } = req.query;
    console.log(`Fetching income statement for symbol: ${symbol}`);

    try {
        const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${FMP_API_KEY}`;
        console.log('API URL:', url);

        const response = await axios.get(url);
        console.log('API Response:', response.data);

        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.status(404).json({ error: 'No data found for the given symbol' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching income statement:', error.message);
        res.status(500).json({ error: 'Failed to fetch income statement' });
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


// Endpoint for fetching fundamentals using FMP
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
        console.error('Error fetching fundamentals:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.message || 'Failed to fetch fundamentals' });
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
        res.status(500).json({ error: error.message || 'Failed to fetch news' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));