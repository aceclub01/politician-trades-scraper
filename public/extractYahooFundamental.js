document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Fetch and display fundamentals using FMP
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
            document.getElementById('targetPE').textContent = fundamentals.peRatio || 'N/A';
            document.getElementById('eps').textContent = fundamentals.eps || 'N/A';
            document.getElementById('oneYearTargetEst').textContent = fundamentals.price || 'N/A';
            document.getElementById('exDividendDate').textContent = fundamentals.exDividendDate || 'N/A';
            document.getElementById('earningsDate').textContent = fundamentals.earningsDate || 'N/A';
            document.getElementById('fiftyTwoWeekRange').textContent = fundamentals.range || 'N/A';
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            document.getElementById('fundamentals').innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    // Fetch and display key statistics
    async function fetchKeyStatistics(symbol) {
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
    }

    // Fetch and display financial growth data
    async function fetchFinancialGrowth(symbol) {
        try {
            console.log(`Fetching financial growth data for symbol: ${symbol}`);

            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchFinancialGrowth?symbol=${symbol}`);
            console.log('Financial Growth API Response:', response);

            const data = await response.json();
            console.log('Financial Growth Data:', data);

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing financial growth data');
            }

            const growthData = data[0];
            console.log('Financial Growth Object:', growthData);

            // Update the DOM with financial growth data
            document.getElementById('freeCashFlowGrowth').textContent = growthData.freeCashFlowGrowth ? `${(growthData.freeCashFlowGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('netIncomeGrowth').textContent = growthData.netIncomeGrowth ? `${(growthData.netIncomeGrowth * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('threeYRevenueGrowthPerShare').textContent = growthData.threeYRevenueGrowthPerShare ? `${(growthData.threeYRevenueGrowthPerShare * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('threeYNetIncomeGrowthPerShare').textContent = growthData.threeYNetIncomeGrowthPerShare ? `${(growthData.threeYNetIncomeGrowthPerShare * 100).toFixed(2)}%` : 'N/A';
            document.getElementById('threeYOperatingCFGrowthPerShare').textContent = growthData.threeYOperatingCFGrowthPerShare ? `${(growthData.threeYOperatingCFGrowthPerShare * 100).toFixed(2)}%` : 'N/A';
        } catch (error) {
            console.error('Error fetching financial growth data:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    }
     // Fetch and display financial income data
    async function fetchIncomeStatement(symbol) {
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
    }
    //Fetch earnings date
    async function fetchEarningsDate(symbol) {
        try {
            console.log(`Fetching earnings date for symbol: ${symbol}`);
    
            const response = await fetch(`https://politician-trades-scraper.onrender.com/fetchEarningsDate?symbol=${symbol}`);
            console.log('Earnings Date API Response:', response);
    
            const data = await response.json();
            console.log('Earnings Date Data:', data);
    
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or missing earnings date data');
            }
    
            const earningsDate = data[0].date ? new Date(data[0].date).toLocaleDateString() : 'N/A';
            document.getElementById('earningsDate').textContent = earningsDate;
        } catch (error) {
            console.error('Error fetching earnings date:', error);
            document.getElementById('fundamentals').innerHTML += `<p>Error: ${error.message}</p>`;
        }
    }

    // Fetch data when the "Fetch Data" button is clicked
    document.getElementById('fetchData').addEventListener('click', async () => {
        console.log('Fetch Data button clicked');

        const pair = document.getElementById('pair').value;
        const period = document.getElementById('period').value;
        const newsLimit = document.getElementById('newsLimit').value;

        try {
            console.log(`Fetching FX data for pair: ${pair}, period: ${period}`);

            // Fetch FX data
            const fxResponse = await fetch(`https://politician-trades-scraper.onrender.com/fxdata?pair=${pair}&period=${period}`);
            const fxData = await fxResponse.json();
            console.log('FX Data:', fxData);

            // Fetch fundamentals
            fetchFundamentals(pair);

            // Fetch key statistics
            fetchKeyStatistics(pair);

            // Fetch financial growth data
            fetchFinancialGrowth(pair);

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

    fetchFundamentals(defaultPair);
    fetchKeyStatistics(defaultPair);
    fetchFinancialGrowth(defaultPair);
    fetchNews(defaultPair, defaultLimit);
});