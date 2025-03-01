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