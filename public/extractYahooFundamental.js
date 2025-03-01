document.addEventListener('DOMContentLoaded', () => {
    // Define fetchFundamentals
    async function fetchFundamentals(symbol) {
        try {
            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchFundamentals?symbol=${symbol}`);
            console.log('Server Response:', response); // Debugging
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Fundamentals Data:', data); // Debugging
    
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing fundamentals data');
            }
    
            const fundamentals = data[0];
            console.log('Fundamentals:', fundamentals); // Debugging
    
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
            const fundamentalsElement = document.getElementById('fundamentals');
            if (fundamentalsElement) {
                fundamentalsElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } else {
                console.error('Element with ID "fundamentals" not found');
            }
        }
    }

    // Fetch and display news using NewsAPI
    async function fetchNews(query, limit) {
        try {
            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchNews?symbol=${query}&limit=${limit}`);
            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid or missing news data from NewsAPI');
            }

            const newsList = document.getElementById('newsHeadlines');
            newsList.innerHTML = data
                .slice(0, limit)
                .map(article => `
                    <li>
                        <a href="${article.url}" target="_blank">${article.title}</a>
                        <span> - ${new Date(article.publishedAt).toLocaleDateString()}</span>
                    </li>
                `)
                .join('');
        } catch (error) {
            console.error('Error fetching news:', error);
            const topNewsElement = document.getElementById('topNews');
            if (topNewsElement) {
                topNewsElement.innerHTML = `<p>Error: ${error.message}</p>`;
            } else {
                console.error('Element with ID "topNews" not found');
            }
        }
    }

    // Fetch data when the "Fetch Data" button is clicked
    document.getElementById('fetchData').addEventListener('click', async () => {
        const pair = document.getElementById('pair').value;
        const period = document.getElementById('period').value;
        const newsLimit = document.getElementById('newsLimit').value;

        try {
            // Fetch FX data
            const fxResponse = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);
            const fxData = await fxResponse.json();
            console.log('FX Data:', fxData);

            // Fetch fundamentals
            fetchFundamentals(pair); // Call fetchFundamentals here

            // Fetch news
            fetchNews(pair, parseInt(newsLimit, 10));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    // Initial load with default pair and limit
    const defaultPair = document.getElementById('pair').value;
    const defaultLimit = parseInt(document.getElementById('newsLimit').value, 10);
    fetchFundamentals(defaultPair); // Call fetchFundamentals here
    fetchNews(defaultPair, defaultLimit);
});