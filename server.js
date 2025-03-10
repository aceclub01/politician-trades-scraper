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
// Helper function to fetch stock symbol from stock name using Yahoo Finance
async function getStockSymbolFromYahoo(stockName) {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(stockName)}&quotesCount=1&newsCount=0`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        console.log('Yahoo Finance Search API Response:', data); // Log the response

        // Check if the API returned valid results
        if (data.quotes && data.quotes.length > 0) {
            return data.quotes[0].symbol; // Return the first matching symbol
        }
        return null; // No symbol found
    } catch (error) {
        console.error('Error fetching stock symbol from Yahoo Finance:', error.message);
        return null;
    }
}
// Helper function to fetch stock symbol from stock name using FinancialModelingPrep
async function getStockSymbol(stockName) {
    const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(stockName)}&limit=1&apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);
        if (response.data && response.data.length > 0) {
            return response.data[0].symbol; // Return the first matching symbol
        }
        return null; // No symbol found
    } catch (error) {
        console.error('Error fetching stock symbol:', error.message);
        return null;
    }
}

// Serve index.html with the stock ticker from the query parameter
app.get('/', (req, res) => {
    const stockTicker = req.query.stock || ''; // Get the stock ticker from the URL query parameter
    res.sendFile(path.join(__dirname, 'public', 'index.html'), { stockTicker });
});

// Endpoint for fetching quote data
// Endpoint for fetching quote data
app.get('/fetchQuote', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is not a symbol (e.g., "TSLA"), assume it's a stock name and fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbolFromYahoo(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/quote-order/${stockSymbol}?apikey=${FMP_API_KEY}`;
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
    const { pair, period } = req.query;

    console.log('Fetching data for pair:', pair); // Log the input pair

    // If the input is not an FX pair (e.g., "USDSGD=X"), assume it's a stock name or symbol
    let symbol = pair;
    if (!pair.includes('=X')) {
        symbol = await getStockSymbolFromYahoo(pair); // Fetch symbol for stock name
        if (!symbol) {
            console.error('Stock symbol not found for:', pair); // Log the error
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    console.log('Using symbol:', symbol); // Log the resolved symbol

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${period}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Endpoint for fetching financial growth data
app.get('/fetchFinancialGrowth', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/financial-growth/${stockSymbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching financial growth data:', error.message);
        res.status(500).json({ error: 'Failed to fetch financial growth data' });
    }
});

// Endpoint for fetching key statistics
app.get('/fetchKeyStatistics', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/key-metrics/${stockSymbol}?apikey=${FMP_API_KEY}`;
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
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/income-statement/${stockSymbol}?apikey=${FMP_API_KEY}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching income statement:', error.message);
        res.status(500).json({ error: 'Failed to fetch income statement' });
    }
});

// Endpoint for fetching earnings date
app.get('/fetchEarningsDate', async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/earning_calendar/${stockSymbol}?apikey=${FMP_API_KEY}`;
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
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/cash-flow-statement-growth/${stockSymbol}?period=annual&apikey=${FMP_API_KEY}`;
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
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/income-statement-growth/${stockSymbol}?period=annual&apikey=${FMP_API_KEY}`;
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
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    const url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement-growth/${stockSymbol}?period=annual&apikey=${FMP_API_KEY}`;
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

    // If the input is a stock name, fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbol(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    // Check if the symbol is an FX pair
    if (stockSymbol.includes('=X')) {
        return res.json([{
            symbol: stockSymbol,
            message: 'Fundamentals not available for FX pairs.'
        }]);
    }

    const url = `https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${FMP_API_KEY}`;
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

    // If the input is not a symbol (e.g., "AVGO"), assume it's a stock name and fetch the symbol
    let stockSymbol = symbol;
    if (!/[A-Z0-9=]+/.test(symbol)) {
        stockSymbol = await getStockSymbolFromYahoo(symbol);
        if (!stockSymbol) {
            return res.status(404).json({ error: 'Stock symbol not found for the given name.' });
        }
    }

    try {
        const url = `https://newsapi.org/v2/everything?q=${stockSymbol}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
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