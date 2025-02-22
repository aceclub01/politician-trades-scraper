let config = {};

async function loadConfig() {
    const response = await fetch('/config');
    config = await response.json();
}

async function fetchNews(query, limit) {
    const response = await fetch(`${config.newsApiUrl}/everything?q=${query}&pageSize=${limit}`);
    const data = await response.json();
    console.log('News Data:', data);
}

async function fetchFundamentals(symbol) {
    const response = await fetch(`${config.fmpApiUrl}/profile/${symbol}`);
    const data = await response.json();
    console.log('Fundamentals:', data);
}

(async function init() {
    await loadConfig();
    fetchNews('AAPL', 5);
    fetchFundamentals('AAPL');
})();
