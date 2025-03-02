document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Fetch and display fundamentals
    async function fetchFundamentals(symbol) {
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
    
            // Format market cap
            const marketCap = fundamentals.mktCap;
            const formattedMarketCap = marketCap >= 1e12 ? `${(marketCap / 1e12).toFixed(1)}T` :
                                       marketCap >= 1e9 ? `${(marketCap / 1e9).toFixed(1)}B` :
                                       marketCap >= 1e6 ? `${(marketCap / 1e6).toFixed(1)}M` :
                                       marketCap >= 1e3 ? `${(marketCap / 1e3).toFixed(1)}K` : marketCap;
    
            // Update the DOM with fundamentals data
            document.getElementById('mktCap').textContent = `$${formattedMarketCap}`;
    
            // Update last close price
            document.getElementById('lastClosePrice').textContent = fundamentals.price ? `$${fundamentals.price}` : 'N/A';
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

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

            // Update the DOM with all data
            updateDOM(quoteData[0], financialGrowthData[0], cashFlowGrowthData[0], incomeStatementGrowthData[0], balanceSheetGrowthData[0]);
        } catch (error) {
            console.error('Error fetching data:', error);
            document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

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

    fetchAllData(defaultPair);
    fetchNews(defaultPair, defaultLimit);
});