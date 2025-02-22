const API_BASE_URL = 'https://politician-trades-scraper.onrender.com';

// Helper function to safely set text content
const setTextContent = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    } else {
        console.error(`Element with ID '${elementId}' not found.`);
    }
};

// Fetch and display news using NewsAPI
async function fetchNews(query, limit) {
    try {
        console.log(`Fetching news for: ${query}`);
        const response = await fetch(`${API_BASE_URL}/fetchNews?symbol=${query}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Check if the response is valid
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

        const response = await fetch(`${API_BASE_URL}/fetchFundamentals?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch fundamentals for ${symbol}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Handle FX pairs
        if (symbol.includes('=X')) {
            console.log('Symbol is an FX pair. Skipping stock fundamentals.');
            setTextContent('mktCap', 'N/A (FX Pair)');
            setTextContent('targetPE', 'N/A (FX Pair)');
            setTextContent('eps', 'N/A (FX Pair)');
            setTextContent('oneYearTargetEst', 'N/A (FX Pair)');
            setTextContent('exDividendDate', 'N/A (FX Pair)');
            setTextContent('earningsDate', 'N/A (FX Pair)');
            setTextContent('fiftyTwoWeekRange', 'N/A (FX Pair)');
            return;
        }

        // Handle stock data
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or missing data from Financial Modeling Prep');
        }

        const fundamentals = data[0];
        console.log('Fundamentals Object:', fundamentals);

        const {
            mktCap,
            price,
            beta,
            lastDiv,
            range,
        } = fundamentals;

        // Update the fundamentals display
        setTextContent('mktCap', mktCap ? `$${mktCap.toLocaleString()}` : 'N/A');
        setTextContent('targetPE', beta || 'N/A');
        setTextContent('eps', price || 'N/A');
        setTextContent('oneYearTargetEst', range || 'N/A');
        setTextContent('exDividendDate', lastDiv || 'N/A');
        setTextContent('earningsDate', range || 'N/A');
        setTextContent('fiftyTwoWeekRange', range || 'N/A');
    } catch (error) {
        console.error('Error fetching fundamentals:', error);
        document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch data when the "Fetch Data" button is clicked
document.getElementById('fetchData').addEventListener('click', async () => {
    const pair = document.getElementById('pair').value.trim();
    const period = document.getElementById('period').value;
    const newsLimit = document.getElementById('newsLimit').value;

    try {
        // Fetch FX data
        await fetchFXData(pair, period);

        // Fetch fundamentals
        fetchFundamentals(pair);

        // Fetch news
        fetchNews(pair, parseInt(newsLimit, 10));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// Example usage (initial load with default pair and limit)
const defaultPair = document.getElementById('pair').value.trim();
const defaultLimit = parseInt(document.getElementById('newsLimit').value, 10);
fetchFundamentals(defaultPair);
fetchNews(defaultPair, defaultLimit);