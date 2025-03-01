const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const FMP_API_KEY = process.env.FMP_API_KEY;

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));