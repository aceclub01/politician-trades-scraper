// Fetch and display news using NewsAPI
async function fetchNews(query, limit) {
    try {
        const response = await fetch(`http://localhost:3000/fetchNews?symbol=${query}&limit=${limit}`);
        const data = await response.json();

        // Check if the response is an array
        if (!Array.isArray(data)) {
            throw new Error('Invalid or missing news data from NewsAPI');
        }

        // Extract news headlines, dates, and links
        const newsList = document.getElementById('newsHeadlines');
        newsList.innerHTML = data
            .slice(0, limit) // Limit the number of news articles
            .map(article => `
                <li>
                    <a href="${article.url}" target="_blank">${article.title}</a>
                    <span> - ${new Date(article.publishedAt).toLocaleDateString()}</span>
                </li>
            `)
            .join('');
    } catch (error) {
        console.error('Error fetching news:', error);
        document.getElementById('topNews').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch and display fundamentals using FMP
async function fetchFundamentals(symbol) {
    try {
        console.log(`Fetching fundamentals for symbol: ${symbol}`);

        // Step 1: Fetch profile data from the API
        const profileResponse = await fetch(`http://localhost:3000/fetchFundamentals?symbol=${symbol}`);
        const profileData = await profileResponse.json();
        console.log('Profile Data:', profileData);

        // Step 2: Fetch key statistics
        const keyStatsResponse = await fetch(`http://localhost:3000/fetchKeyStatistics?symbol=${symbol}`);
        const keyStatsData = await keyStatsResponse.json();
        console.log('Key Statistics Data:', keyStatsData);

        // Step 3: Fetch income statement data
        const incomeStatementResponse = await fetch(`http://localhost:3000/fetchIncomeStatement?symbol=${symbol}`);
        const incomeStatementData = await incomeStatementResponse.json();
        console.log('Income Statement Data:', incomeStatementData);

        // Step 4: Fetch dividend data
        const dividendResponse = await fetch(`http://localhost:3000/fetchDividendData?symbol=${symbol}`);
        const dividendData = await dividendResponse.json();
        console.log('Dividend Data:', dividendData);

        // Step 5: Check if the symbol is an FX pair
        if (symbol.includes('=X')) {
            console.log('Symbol is an FX pair. Skipping stock fundamentals.');
            document.getElementById('mktCap').textContent = 'N/A (FX Pair)';
            document.getElementById('targetPE').textContent = 'N/A (FX Pair)';
            document.getElementById('eps').textContent = 'N/A (FX Pair)';
            document.getElementById('oneYearTargetEst').textContent = 'N/A (FX Pair)';
            document.getElementById('exDividendDate').textContent = 'N/A (FX Pair)';
            document.getElementById('earningsDate').textContent = 'N/A (FX Pair)';
            document.getElementById('fiftyTwoWeekRange').textContent = 'N/A (FX Pair)';
            return;
        }

        // Step 6: Handle stock data
        if (!Array.isArray(profileData) || profileData.length === 0) {
            throw new Error('Invalid or missing data from Financial Modeling Prep');
        }

        const profile = profileData[0];
        const keyStats = keyStatsData[0];
        const incomeStatement = incomeStatementData[0];
        const dividend = dividendData.historical?.[0]; // Get the latest dividend data

        console.log('Profile:', profile);
        console.log('Key Stats:', keyStats);
        console.log('Income Statement:', incomeStatement);
        console.log('Dividend:', dividend);

        // Step 7: Extract and display relevant fields
        document.getElementById('mktCap').textContent = profile.mktCap ? `$${profile.mktCap.toLocaleString()}` : 'N/A';
        document.getElementById('targetPE').textContent = keyStats?.peRatio || 'N/A';
        document.getElementById('eps').textContent = incomeStatement?.eps || 'N/A';
        document.getElementById('oneYearTargetEst').textContent = profile.price || 'N/A';
        document.getElementById('exDividendDate').textContent = dividend?.date || 'N/A';
        document.getElementById('earningsDate').textContent = profile.lastDiv || 'N/A';
        document.getElementById('fiftyTwoWeekRange').textContent = profile.range || 'N/A';

        // Additional fields for key statistics
        document.getElementById('profitMargin').textContent = keyStats?.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('quarterlyRevenueGrowth').textContent = keyStats?.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('returnOnEquity').textContent = keyStats?.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('quarterlyEarningsGrowth').textContent = keyStats?.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('shortRatio').textContent = keyStats?.shortRatio || 'N/A';

        // Log all available fields in the data objects
        console.log('All Available Profile Fields:', Object.keys(profile));
        console.log('All Available Key Stats Fields:', Object.keys(keyStats));
        console.log('All Available Income Statement Fields:', Object.keys(incomeStatement));
        console.log('All Available Dividend Fields:', Object.keys(dividend));
    } catch (error) {
        console.error('Error fetching fundamentals:', error);
        document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch data when the "Fetch Data" button is clicked
document.getElementById('fetchData').addEventListener('click', async () => {
    const pair = document.getElementById('pair').value; // Get the FX pair from the input field
    const period = document.getElementById('period').value;
    const newsLimit = document.getElementById('newsLimit').value; // Get the selected news limit

    try {
        // Fetch FX data
        const fxResponse = await fetch(`http://localhost:3000/fxdata?pair=${pair}&period=${period}`);
        const fxData = await fxResponse.json();
        console.log('FX Data:', fxData);
        // Render your chart here using the FX data

        // Fetch fundamentals based on the FX pair
        fetchFundamentals(pair);

        // Fetch news based on the FX pair and selected limit
        fetchNews(pair, parseInt(newsLimit, 10));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// Example usage (initial load with default pair and limit)
const defaultPair = document.getElementById('pair').value; // Get the default pair value
const defaultLimit = parseInt(document.getElementById('newsLimit').value, 10); // Get the default limit
fetchFundamentals(defaultPair); // Fetch fundamentals for the default pair
fetchNews(defaultPair, defaultLimit); // Fetch news for the default pair and limit