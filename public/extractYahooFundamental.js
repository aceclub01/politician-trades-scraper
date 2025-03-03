document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const fetchDataButton = document.getElementById('fetchData');
    const pairInput = document.getElementById('pair');
    const newsLimitInput = document.getElementById('newsLimit');

    if (!fetchDataButton || !pairInput || !newsLimitInput) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    // Fetch and display data when the "Fetch Data" button is clicked
    fetchDataButton.addEventListener('click', async () => {
        const pair = pairInput.value;
        const newsLimit = newsLimitInput.value;
        await fetchData(pair, newsLimit);
    });

    // Define the fetchData function
    const fetchData = async (pair, newsLimit) => {
        try {
            console.log(`Fetching data for pair: ${pair}, newsLimit: ${newsLimit}`);

            // Fetch fundamentals
            await fetchFundamentals(pair);

            // Fetch key statistics
            await fetchKeyStatistics(pair);

            // Fetch income statement
            await fetchIncomeStatement(pair);

            // Fetch news
            await fetchNews(pair, parseInt(newsLimit, 10));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Fetch and display fundamentals using FMP
    const fetchFundamentals = async (symbol) => {
        try {
            console.log(`Fetching fundamentals for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchFundamentals?symbol=${symbol}`);
            console.log('Fundamentals API Response:', response);

            if (!response.ok) {
                throw new Error(`Failed to fetch fundamentals: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fundamentals Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing fundamentals data');
            }

            const fundamentals = data[0];
            console.log('Fundamentals Object:', fundamentals);

            // Update the DOM with fundamentals data
            updateElement('mktCap', fundamentals.mktCap ? `$${fundamentals.mktCap.toLocaleString()}` : 'N/A');
            updateElement('targetPE', fundamentals.peRatio || 'N/A');
            updateElement('eps', fundamentals.eps || 'N/A');
            updateElement('oneYearTargetEst', fundamentals.price || 'N/A');
            updateElement('exDividendDate', fundamentals.lastDiv || 'N/A');
            updateElement('earningsDate', fundamentals.range || 'N/A');
            updateElement('fiftyTwoWeekRange', fundamentals.range || 'N/A');
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            updateElement('fundamentals', `<p>Error: ${error.message}</p>`);
        }
    };

    // Helper function to safely update DOM elements
    const updateElement = (id, content) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        } else {
            console.error(`Element with ID "${id}" not found`);
        }
    };

    // Fetch and display key statistics
    // const fetchKeyStatistics = async (symbol) => {
    //     try {
    //         console.log(`Fetching key statistics for symbol: ${symbol}`);

    //         const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchKeyStatistics?symbol=${symbol}`);
    //         console.log('Key Statistics API Response:', response);

    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch key statistics: ${response.statusText}`);
    //         }

    //         const data = await response.json();
    //         console.log('Key Statistics Data:', data);

    //         if (!Array.isArray(data) || data.length === 0) {
    //             throw new Error('Invalid or missing key statistics data');
    //         }

    //         const keyStats = data[0];
    //         console.log('Key Statistics Object:', keyStats);

    //         // Update the DOM with key statistics
    //         updateElement('profitMargin', keyStats.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A');
    //         updateElement('quarterlyRevenueGrowth', keyStats.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A');
    //         updateElement('returnOnEquity', keyStats.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A');
    //         updateElement('quarterlyEarningsGrowth', keyStats.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A');
    //         updateElement('shortRatio', keyStats.shortRatio || 'N/A');
    //     } catch (error) {
    //         console.error('Error fetching key statistics:', error);
    //         updateElement('fundamentals', `<p>Error: ${error.message}</p>`);
    //     }
    // };
    const fetchKeyStatistics = async (symbol) => {
        try {
            console.log(`Fetching key statistics for symbol: ${symbol}`);
    
            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchKeyStatistics?symbol=${symbol}`);
            console.log('Key Statistics API Response:', response);
    
            if (!response.ok) {
                throw new Error(`Failed to fetch key statistics: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Key Statistics Data:', data);
    
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing key statistics data');
            }
    
            const keyStats = data[0];
            console.log('Key Statistics Object:', keyStats);
    
            // Update the DOM with key statistics
            updateElement('profitMargin', keyStats.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A');
            updateElement('quarterlyRevenueGrowth', keyStats.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A');
            updateElement('returnOnEquity', keyStats.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A');
            updateElement('quarterlyEarningsGrowth', keyStats.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A');
            updateElement('shortRatio', keyStats.shortRatio || 'N/A');
        } catch (error) {
            console.error('Error fetching key statistics:', error);
            updateElement('fundamentals', `<p>Error: ${error.message}</p>`);
        }
    };

    // Fetch and display income statement
    const fetchIncomeStatement = async (symbol) => {
        try {
            console.log(`Fetching income statement for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchIncomeStatement?symbol=${symbol}`);
            console.log('Income Statement API Response:', response);

            if (!response.ok) {
                throw new Error(`Failed to fetch income statement: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Income Statement Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing income statement data');
            }

            const incomeStatement = data[0];
            console.log('Income Statement Object:', incomeStatement);

            // Update the DOM with income statement data
            updateElement('eps', incomeStatement.eps || 'N/A');
        } catch (error) {
            console.error('Error fetching income statement:', error);
            updateElement('fundamentals', `<p>Error: ${error.message}</p>`);
        }
    };

    // Fetch and display news using NewsAPI
    const fetchNews = async (query, limit) => {
        try {
            console.log(`Fetching news for query: ${query}, limit: ${limit}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchNews?symbol=${query}&limit=${limit}`);
            console.log('News API Response:', response);

            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.statusText}`);
            }

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
    };

    // Read the stock ticker from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const stockTicker = urlParams.get('stock');

    // If a stock ticker is provided in the URL, set it in the input field and fetch data
    if (stockTicker) {
        pairInput.value = stockTicker;
        fetchData(stockTicker, newsLimitInput.value); // Automatically fetch and display data
    }
});