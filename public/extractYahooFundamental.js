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

        // Get the news container
        const newsList = document.getElementById('newsHeadlines');
        const topNews = document.getElementById('topNews');

        if (!newsList || !topNews) {
            throw new Error('News container elements not found in the DOM.');
        }

        // Extract news headlines, dates, and links
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
        const topNews = document.getElementById('topNews');
        if (topNews) {
            topNews.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
            console.error('Top news container not found.');
        }
    }
}

// Fetch and display fundamentals using FMP
async function fetchFundamentals(symbol) {
    try {
        console.log(`Fetching fundamentals for symbol: ${symbol}`);

        const response = await fetch(`${API_BASE_URL}/fetchFundamentals?symbol=${symbol}`);
        console.log('API Response:', response);

        if (!response.ok) {
            throw new Error(`Failed to fetch fundamentals for ${symbol}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Data:', data);

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
        const fundamentalsContainer = document.getElementById('fundamentals');
        if (fundamentalsContainer) {
            fundamentalsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
            console.error('Fundamentals container not found.');
        }
    }
}
// Add event listener for the "Fetch Data" button
document.getElementById('fetchData').addEventListener('click', async () => {
    const pair = document.getElementById('pair').value; // Get the FX pair from the input field
    console.log('Fetching data for symbol:', pair); // Log the symbol
    const period = document.getElementById('period').value;
    const newsLimit = document.getElementById('newsLimit').value;

    try {
        // Fetch FX data
        const fxResponse = await fetch(`${API_BASE_URL}/fxdata?pair=${pair}&period=${period}`);
        const fxData = await fxResponse.json();
        console.log('FX Data:', fxData);

        // Fetch fundamentals
        await fetchFundamentals(pair);

        // Fetch news
        await fetchNews(pair, parseInt(newsLimit, 10));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});