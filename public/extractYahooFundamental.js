document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Fetch and display fundamentals using FMP
    async function fetchFundamentals(symbol) {
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

            // Update the DOM with fundamentals data (check if elements exist first)
            const mktCapElement = document.getElementById('mktCap');
            const targetPEElement = document.getElementById('targetPE');
            const epsElement = document.getElementById('eps');
            const oneYearTargetEstElement = document.getElementById('oneYearTargetEst');
            const exDividendDateElement = document.getElementById('exDividendDate');
            const earningsDateElement = document.getElementById('earningsDate');
            const fiftyTwoWeekRangeElement = document.getElementById('fiftyTwoWeekRange');

            if (mktCapElement) mktCapElement.textContent = fundamentals.mktCap ? `$${fundamentals.mktCap.toLocaleString()}` : 'N/A';
            if (targetPEElement) targetPEElement.textContent = fundamentals.peRatio || 'N/A';
            if (epsElement) epsElement.textContent = fundamentals.eps || 'N/A';
            if (oneYearTargetEstElement) oneYearTargetEstElement.textContent = fundamentals.price || 'N/A';
            if (exDividendDateElement) exDividendDateElement.textContent = fundamentals.lastDiv || 'N/A';
            if (earningsDateElement) earningsDateElement.textContent = fundamentals.range || 'N/A';
            if (fiftyTwoWeekRangeElement) fiftyTwoWeekRangeElement.textContent = fundamentals.range || 'N/A';
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            const fundamentalsContainer = document.getElementById('fundamentals');
            if (fundamentalsContainer) {
                fundamentalsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            }
        }
    }

    // Fetch and display key statistics
    async function fetchKeyStatistics(symbol) {
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

            // Update the DOM with key statistics (check if elements exist first)
            const profitMarginElement = document.getElementById('profitMargin');
            const quarterlyRevenueGrowthElement = document.getElementById('quarterlyRevenueGrowth');
            const returnOnEquityElement = document.getElementById('returnOnEquity');
            const quarterlyEarningsGrowthElement = document.getElementById('quarterlyEarningsGrowth');
            const shortRatioElement = document.getElementById('shortRatio');

            if (profitMarginElement) profitMarginElement.textContent = keyStats.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A';
            if (quarterlyRevenueGrowthElement) quarterlyRevenueGrowthElement.textContent = keyStats.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A';
            if (returnOnEquityElement) returnOnEquityElement.textContent = keyStats.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A';
            if (quarterlyEarningsGrowthElement) quarterlyEarningsGrowthElement.textContent = keyStats.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A';
            if (shortRatioElement) shortRatioElement.textContent = keyStats.shortRatio || 'N/A';
        } catch (error) {
            console.error('Error fetching key statistics:', error);
            const fundamentalsContainer = document.getElementById('fundamentals');
            if (fundamentalsContainer) {
                fundamentalsContainer.innerHTML += `<p>Error: ${error.message}</p>`;
            }
        }
    }

    // Fetch and display income statement
    async function fetchIncomeStatement(symbol) {
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

            // Update the DOM with income statement data (check if elements exist first)
            const epsElement = document.getElementById('eps');
            if (epsElement) epsElement.textContent = incomeStatement.eps || 'N/A';
        } catch (error) {
            console.error('Error fetching income statement:', error);
            const fundamentalsContainer = document.getElementById('fundamentals');
            if (fundamentalsContainer) {
                fundamentalsContainer.innerHTML += `<p>Error: ${error.message}</p>`;
            }
        }
    }

    // Fetch and display news using NewsAPI
    async function fetchNews(query, limit) {
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
            if (!fxResponse.ok) {
                throw new Error(`Failed to fetch FX data: ${fxResponse.statusText}`);
            }
            const fxData = await fxResponse.json();
            console.log('FX Data:', fxData);

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