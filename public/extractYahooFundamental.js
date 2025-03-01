document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Fetch and display fundamentals using FMP
    async function fetchFundamentals(symbol) {
        try {
            console.log(`Fetching fundamentals for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchFundamentals?symbol=${symbol}`);
            console.log('Fundamentals API Response:', response);

            const data = await response.json();
            console.log('Fundamentals Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing fundamentals data');
            }

            const fundamentals = data[0];
            console.log('Fundamentals Object:', fundamentals);

            // Update the DOM with fundamentals data
            document.getElementById('mktCap').textContent = fundamentals.mktCap ? `$${fundamentals.mktCap.toLocaleString()}` : 'N/A';
            document.getElementById('targetPE').textContent = fundamentals.peRatio || 'N/A';
            document.getElementById('eps').textContent = fundamentals.eps || 'N/A';
            document.getElementById('oneYearTargetEst').textContent = fundamentals.price || 'N/A';
            document.getElementById('exDividendDate').textContent = fundamentals.lastDiv || 'N/A';
            document.getElementById('earningsDate').textContent = fundamentals.range || 'N/A';
            document.getElementById('fiftyTwoWeekRange').textContent = fundamentals.range || 'N/A';
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    // Fetch and display key statistics
    async function fetchKeyStatistics(symbol) {
        try {
            console.log(`Fetching key statistics for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchKeyStatistics?symbol=${symbol}`);
            console.log('Key Statistics API Response:', response);

            const data = await response.json();
            console.log('Key Statistics Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing key statistics data');
            }

            const keyStats = data[0];
            console.log('Key Statistics Object:', keyStats);

            // Update the DOM with key statistics
            document.getElementById('profitMargin').textContent = keyStats.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('quarterlyRevenueGrowth').textContent = keyStats.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('returnOnEquity').textContent = keyStats.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('quarterlyEarningsGrowth').textContent = keyStats.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('shortRatio').textContent = keyStats.shortRatio || 'N/A';
        } catch (error) {
            console.error('Error fetching key statistics:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    }

    // Fetch and display income statement
    async function fetchIncomeStatement(symbol) {
        try {
            console.log(`Fetching income statement for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchIncomeStatement?symbol=${symbol}`);
            console.log('Income Statement API Response:', response);

            const data = await response.json();
            console.log('Income Statement Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing income statement data');
            }

            const incomeStatement = data[0];
            console.log('Income Statement Object:', incomeStatement);

            // Update the DOM with income statement data
            document.getElementById('eps').textContent = incomeStatement.eps || 'N/A';
        } catch (error) {
            console.error('Error fetching income statement:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    }

    // Fetch and display news using NewsAPI
    async function fetchNews(query, limit) {
        try {
            console.log(`Fetching news for query: ${query}, limit: ${limit}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchNews?symbol=${query}&limit=${limit}`);
            console.log('News API Response:', response);

            const data = await response.json();
            console.log('News Data:', data);

            if (!Array.isArray(data)) {
                throw new Error('Invalid or missing news data from NewsAPI');
            }

            const newsList = document.getElementById('newsHeadlines');
            if (!newsList) {
                throw new Error('News container element not found in the DOM');
            }

            // Clear previous news
            newsList.innerHTML = '';

            // Add news articles to the list
            data.slice(0, limit).forEach(article => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <a href="${article.url}" target="_blank">${article.title}</a>
                    <span> - ${new Date(article.publishedAt).toLocaleDateString()}</span>
                `;
                newsList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            const topNewsContainer = document.getElementById('topNews');
            if (topNewsContainer) {
                topNewsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            } else {
                console.error('Top news container not found.');
            }
        }
    }

    // Fetch data when the "Fetch Data" button is clicked
    document.getElementById('fetchData').addEventListener('click', async () => {
        console.log('Fetch Data button clicked');

        const pair = document.getElementById('pair').value;
        const period = document.getElementById('period').value;
        const newsLimit = document.getElementById('newsLimit').value;

        try {
            console.log(`Fetching FX data for pair: ${pair}, period: ${period}`);

            // Fetch FX data
            const fxResponse = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);
            const fxData = await fxResponse.json();
            console.log('FX Data:', fxData);

            // Fetch fundamentals
            fetchFundamentals(pair);

            // Fetch key statistics
            fetchKeyStatistics(pair);

            // Fetch income statement
            fetchIncomeStatement(pair);

            // Fetch news
            fetchNews(pair, parseInt(newsLimit, 10));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    // Initial load with default pair and limit
    const defaultPair = document.getElementById('pair').value;
    const defaultLimit = parseInt(document.getElementById('newsLimit').value, 10);
    console.log(`Initial load with default pair: ${defaultPair}, limit: ${defaultLimit}`);

    fetchFundamentals(defaultPair);
    fetchKeyStatistics(defaultPair);
    fetchIncomeStatement(defaultPair);
    fetchNews(defaultPair, defaultLimit);
});