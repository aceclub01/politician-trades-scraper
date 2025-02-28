const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const FMP_API_KEY = process.env.FMP_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.use(express.static('public'));

// Existing FX data endpoint (unchanged)
app.get('/fxdata', async (req, res) => {
    const { pair, period } = req.query;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=${period}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FX data' });
    }
});

// Endpoint for fetching fundamentals using FMP, now with additional statistics
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

    try {
        // Fetch multiple endpoints in parallel
        const [profile, keyMetrics, financialGrowth, quote] = await Promise.all([
            axios.get(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
            axios.get(`https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${FMP_API_KEY}`),
            axios.get(`https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?apikey=${FMP_API_KEY}`),
            axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`)
        ]);

        if (!Array.isArray(profile.data) || profile.data.length === 0) {
            return res.status(404).json({ error: 'Symbol not found or no data available' });
        }

        const companyData = profile.data[0];
        const metrics = keyMetrics.data[0] || {};
        const growth = financialGrowth.data[0] || {};
        const quoteData = quote.data[0] || {};

        // Construct response with additional statistics
        const responseData = {
            symbol: companyData.symbol,
            companyName: companyData.companyName,
            industry: companyData.industry,
            marketCap: companyData.mktCap,
            profitMargin: metrics.netProfitMargin,
            returnOnEquity: metrics.returnOnEquity,
            quarterlyRevenueGrowth: growth.revenueGrowth,
            avgVolume3Months: quoteData.avgVolume,
            avgVolume10Days: quoteData.avgVolume10Days,
            // Short ratio is not directly available on FMP, so it is omitted
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching fundamentals:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch fundamentals' });
    }
});

// Endpoint for fetching news using NewsAPI
app.get('/fetchNews', async (req, res) => {
    const { symbol, limit } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    try {
        const url = `https://newsapi.org/v2/everything?q=${symbol}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
        const response = await axios.get(url);

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
