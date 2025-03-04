document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

     // Extract the stock ticker from the URL query parameter
     const urlParams = new URLSearchParams(window.location.search);
     const stockTicker = urlParams.get('stock');
 
     // If a stock ticker is provided, update the input field
     if (stockTicker) {
         document.getElementById('pair').value = stockTicker.toUpperCase();
     }
 
     // Rest of your existing code...
     const fetchDataButton = document.getElementById('fetchData');
     if (fetchDataButton) {
         fetchDataButton.click(); // Automatically trigger data fetch
     }

    // Function to parse query parameters from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Automatically populate the input field and trigger button click
    const stock = getQueryParam('stocks');
    if (stock) {
        const pairInput = document.getElementById('pair');
        pairInput.value = stock;

        // Trigger the "Fetch Data" button click
        const fetchDataButton = document.getElementById('fetchData');
        fetchDataButton.click();
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

    // Fetch and display all data
   const fetchAllData = async (symbol) => {
    try {
        // Fetch quote data
        const quoteResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchQuote?symbol=${symbol}`);
        if (!quoteResponse.ok) {
            throw new Error(`Failed to fetch quote data: ${quoteResponse.statusText}`);
        }
        const quoteData = await quoteResponse.json();
        console.log('Quote Data:', quoteData);

        // Fetch financial growth data
        const financialGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchFinancialGrowth?symbol=${symbol}`);
        if (!financialGrowthResponse.ok) {
            throw new Error(`Failed to fetch financial growth data: ${financialGrowthResponse.statusText}`);
        }
        const financialGrowthData = await financialGrowthResponse.json();
        console.log('Financial Growth Data:', financialGrowthData);

        // Fetch cash flow growth data
        const cashFlowGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchCashFlowGrowth?symbol=${symbol}`);
        if (!cashFlowGrowthResponse.ok) {
            throw new Error(`Failed to fetch cash flow growth data: ${cashFlowGrowthResponse.statusText}`);
        }
        const cashFlowGrowthData = await cashFlowGrowthResponse.json();
        console.log('Cash Flow Growth Data:', cashFlowGrowthData);

        // Fetch income statement growth data
        const incomeStatementGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchIncomeStatementGrowth?symbol=${symbol}`);
        if (!incomeStatementGrowthResponse.ok) {
            throw new Error(`Failed to fetch income statement growth data: ${incomeStatementGrowthResponse.statusText}`);
        }
        const incomeStatementGrowthData = await incomeStatementGrowthResponse.json();
        console.log('Income Statement Growth Data:', incomeStatementGrowthData);

        // Fetch balance sheet growth data
        const balanceSheetGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchBalanceSheetGrowth?symbol=${symbol}`);
        if (!balanceSheetGrowthResponse.ok) {
            throw new Error(`Failed to fetch balance sheet growth data: ${balanceSheetGrowthResponse.statusText}`);
        }
        const balanceSheetGrowthData = await balanceSheetGrowthResponse.json();
        console.log('Balance Sheet Growth Data:', balanceSheetGrowthData);

        // Check if all data is available
        if (
            !quoteData || !quoteData[0] ||
            !financialGrowthData || !financialGrowthData[0] ||
            !cashFlowGrowthData || !cashFlowGrowthData[0] ||
            !incomeStatementGrowthData || !incomeStatementGrowthData[0] ||
            !balanceSheetGrowthData || !balanceSheetGrowthData[0]
        ) {
            throw new Error('Incomplete or missing data from API for your input asset');
        }

        // Update the DOM with all data
        updateDOM(quoteData[0], financialGrowthData[0], cashFlowGrowthData[0], incomeStatementGrowthData[0], balanceSheetGrowthData[0]);
    } catch (error) {
        console.error('Error fetching data:', error);
        const fundamentalsElement = document.getElementById('fundamentals');
        if (fundamentalsElement) {
            fundamentalsElement.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
            console.error('Fundamentals element not found in the DOM');
        }
    }
};

    // Update the DOM with fetched data
    function updateDOM(quote, financialGrowth, cashFlowGrowth, incomeStatementGrowth, balanceSheetGrowth) {
        // Quote Data (Light Grey)
        document.getElementById('eps').textContent = quote.eps || 'N/A';
        document.getElementById('pe').textContent = quote.pe || 'N/A';
        document.getElementById('volume').textContent = quote.volume ? quote.volume.toLocaleString() : 'N/A';
        document.getElementById('avgVolume').textContent = quote.avgVolume ? quote.avgVolume.toLocaleString() : 'N/A';

        // Financial Growth Data (Light Blue)
        document.getElementById('revenueGrowth').textContent = financialGrowth.revenueGrowth ? `${(financialGrowth.revenueGrowth * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('grossProfitGrowth').textContent = financialGrowth.grossProfitGrowth ? `${(financialGrowth.grossProfitGrowth * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('threeYRevenueGrowthPerShare').textContent = financialGrowth.threeYRevenueGrowthPerShare ? `${(financialGrowth.threeYRevenueGrowthPerShare * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('threeYOperatingCFGrowthPerShare').textContent = financialGrowth.threeYOperatingCFGrowthPerShare ? `${(financialGrowth.threeYOperatingCFGrowthPerShare * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('threeYNetIncomeGrowthPerShare').textContent = financialGrowth.threeYNetIncomeGrowthPerShare ? `${(financialGrowth.threeYNetIncomeGrowthPerShare * 100).toFixed(2)}%` : 'N/A';

        // Cash Flow Growth Data (Light Green)
        document.getElementById('growthNetIncome').textContent = cashFlowGrowth.growthNetIncome ? `${(cashFlowGrowth.growthNetIncome * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('growthFreeCashFlow').textContent = cashFlowGrowth.growthFreeCashFlow ? `${(cashFlowGrowth.growthFreeCashFlow * 100).toFixed(2)}%` : 'N/A';

        // Income Statement Growth Data (Light Pink)
        document.getElementById('growthRevenue').textContent = incomeStatementGrowth.growthRevenue ? `${(incomeStatementGrowth.growthRevenue * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('growthEBITDA').textContent = incomeStatementGrowth.growthEBITDA ? `${(incomeStatementGrowth.growthEBITDA * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('growthOperatingIncome').textContent = incomeStatementGrowth.growthOperatingIncome ? `${(incomeStatementGrowth.growthOperatingIncome * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('growthEPS').textContent = incomeStatementGrowth.growthEPS ? `${(incomeStatementGrowth.growthEPS * 100).toFixed(2)}%` : 'N/A';

        // Balance Sheet Growth Data (Light Violet)
        document.getElementById('growthShortTermDebt').textContent = balanceSheetGrowth.growthShortTermDebt ? `${(balanceSheetGrowth.growthShortTermDebt * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('growthNetDebt').textContent = balanceSheetGrowth.growthNetDebt ? `${(balanceSheetGrowth.growthNetDebt * 100).toFixed(2)}%` : 'N/A';
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

            // Fetch all data
            fetchAllData(pair);

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

    fetchNews(defaultPair, defaultLimit);
    fetchAllData(defaultPair);
});