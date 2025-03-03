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

            const data = await response.json();
            console.log('Fundamentals Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing fundamentals data');
            }

            const fundamentals = data[0];
            console.log('Fundamentals Object:', fundamentals);

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
            document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
        }
    };

    // Fetch and display key statistics
    const fetchKeyStatistics = async (symbol) => {
        try {
            console.log(`Fetching key statistics for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchKeyStatistics?symbol=${symbol}`);
            console.log('Key Statistics API Response:', response);

            const data = await response.json();
            console.log('Key Statistics Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing key statistics data');
            }

            const keyStats = data[0];
            console.log('Key Statistics Object:', keyStats);

            // Update the DOM with key statistics
            document.getElementById('profitMargin').textContent = keyStats.profitMargin ? `${(keyStats.profitMargin * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('quarterlyRevenueGrowth').textContent = keyStats.revenueGrowth ? `${(keyStats.revenueGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('returnOnEquity').textContent = keyStats.roe ? `${(keyStats.roe * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('quarterlyEarningsGrowth').textContent = keyStats.netIncomeGrowth ? `${(keyStats.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('shortRatio').textContent = keyStats.shortRatio || 'N/A';
        } catch (error) {
            console.error('Error fetching key statistics:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    };

    // Fetch and display income statement
    const fetchIncomeStatement = async (symbol) => {
        try {
            console.log(`Fetching income statement for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchIncomeStatement?symbol=${symbol}`);
            console.log('Income Statement API Response:', response);

            const data = await response.json();
            console.log('Income Statement Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing income statement data');
            }

            const incomeStatement = data[0];
            console.log('Income Statement Object:', incomeStatement);

            // Update the DOM with income statement data
            document.getElementById('eps').textContent = incomeStatement.eps || 'N/A';
        } catch (error) {
            console.error('Error fetching income statement:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    };

    // Fetch and display news using NewsAPI
    const fetchNews = async (query, limit) => {
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
    };
     // Fetch and display all data
     async function fetchAllData(symbol) {
        try {
            // Fetch quote data
            const quoteResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchQuote?symbol=${symbol}`);
            const quoteData = await quoteResponse.json();
            console.log('Quote Data:', quoteData);

            // Fetch financial growth data
            const financialGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchFinancialGrowth?symbol=${symbol}`);
            const financialGrowthData = await financialGrowthResponse.json();
            console.log('Financial Growth Data:', financialGrowthData);

            // Fetch cash flow growth data
            const cashFlowGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchCashFlowGrowth?symbol=${symbol}`);
            const cashFlowGrowthData = await cashFlowGrowthResponse.json();
            console.log('Cash Flow Growth Data:', cashFlowGrowthData);

            // Fetch income statement growth data
            const incomeStatementGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchIncomeStatementGrowth?symbol=${symbol}`);
            const incomeStatementGrowthData = await incomeStatementGrowthResponse.json();
            console.log('Income Statement Growth Data:', incomeStatementGrowthData);

            // Fetch balance sheet growth data
            const balanceSheetGrowthResponse = await fetch(`https://politician-trades-scraper.onrender.com/fetchBalanceSheetGrowth?symbol=${symbol}`);
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
                throw new Error('Incomplete or missing data from API');
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
    }

    // Read the stock ticker from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const stockTicker = urlParams.get('stock');
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
    // If a stock ticker is provided in the URL, set it in the input field and fetch data
    if (stockTicker) {
        pairInput.value = stockTicker;
        fetchData(stockTicker, newsLimitInput.value); // Automatically fetch and display data
    }
});