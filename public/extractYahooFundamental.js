document.addEventListener('DOMContentLoaded', () => {
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

    // Read the stock ticker from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const stockTicker = urlParams.get('stock');

    // If a stock ticker is provided in the URL, set it in the input field and fetch data
    if (stockTicker) {
        pairInput.value = stockTicker;
        fetchData(stockTicker, newsLimitInput.value); // Automatically fetch and display data
    }

    // Other functions (fetchFundamentals, fetchKeyStatistics, etc.) remain unchanged
});