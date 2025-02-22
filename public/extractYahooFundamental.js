// Base URL for the Render deployment
const API_BASE_URL = 'https://politician-trades-scraper.onrender.com';

// Fetch and display news using NewsAPI
async function fetchNews(query, limit) {
    try {
        const response = await fetch(`${API_BASE_URL}/fetchNews?symbol=${query}&limit=${limit}`);
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

        // Step 1: Fetch data from the API
        const response = await fetch(`${API_BASE_URL}/fetchFundamentals?symbol=${symbol}`);
        console.log('API Response:', response);

        // Step 2: Parse the response as JSON
        const data = await response.json();
        console.log('Parsed API Data:', data);

        // Step 3: Check if the symbol is an FX pair
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

        // Step 4: Handle stock data
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or missing data from Financial Modeling Prep');
        }

        const fundamentals = data[0];
        console.log('Fundamentals Object:', fundamentals);

        // Step 5: Extract and display relevant fields
        const {
            mktCap,
            price,
            beta,
            lastDiv,
            range,
            companyName,
            exchange,
            industry,
            website,
            description,
            ceo,
            sector,
            image
        } = fundamentals;

        console.log('Extracted Fields:', {
            mktCap,
            price,
            beta,
            lastDiv,
            range,
            companyName,
            exchange,
            industry,
            website,
            description,
            ceo,
            sector,
            image
        });

        document.getElementById('mktCap').textContent = mktCap ? `$${mktCap.toLocaleString()}` : 'N/A';
        document.getElementById('targetPE').textContent = beta || 'N/A';
        document.getElementById('eps').textContent = price || 'N/A';
        document.getElementById('oneYearTargetEst').textContent = range || 'N/A';
        document.getElementById('exDividendDate').textContent = lastDiv || 'N/A';
        document.getElementById('earningsDate').textContent = range || 'N/A';
        document.getElementById('fiftyTwoWeekRange').textContent = range || 'N/A';

        // Step 6: Log all available fields in the fundamentals object
        console.log('All Available Fields:', Object.keys(fundamentals));
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
        const fxResponse = await fetch(`${API_BASE_URL}/fxdata?pair=${pair}&period=${period}`);
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
