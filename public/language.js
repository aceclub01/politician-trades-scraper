// language.js

const translations = {
    en: {
        title: "Auto Analyser Assistant",
        pairLabel: "Stock/FX Pair:",
        periodLabel: "Period:",
        newsLimitLabel: "Number of News Articles:",
        intervalSliderLabel: "Interval (number of periods to consider):",
        fibonacci: "Show Fibonacci",
        elliot: "Show Elliot Waves",
        diagonalLinesLabel: "Number of Diagonal Lines:",
        historyBarsLabel: "History Bars:",
        resolutionLabel: "Resolution (bars):",
        alphaSliderLabel: "MACD Histogram Transparency:",
        fetchData: "Fetch Fundamentals and Top News",
        fetchChartData: "Update Chart",
        fundamentalsTitle: "Fundamentals",
        topNewsTitle: "Top News",
        basics: "Basics",
        marketCap: "Market Cap:",
        eps: "EPS:",
        peRatio: "PE Ratio:",
        volume: "Volume:",
        avgVolume: "Avg Volume:",
        financialGrowth: "Financial Growth",
        revenueGrowth: "Revenue Growth:",
        grossProfitGrowth: "Gross Profit Growth:",
        threeYRevenueGrowthPerShare: "3Y Revenue Growth Per Share:",
        threeYOperatingCFGrowthPerShare: "3Y Operating CF Growth Per Share:",
        threeYNetIncomeGrowthPerShare: "3Y Net Income Growth Per Share:",
        cashflowGrowth: "Cashflow Growth",
        netIncomeGrowth: "Net Income Growth:",
        freeCashFlowGrowth: "Free Cash Flow Growth:",
        balanceSheet: "Balance Sheet",
        shortTermDebtGrowth: "Short-Term Debt Growth:",
        netDebtGrowth: "Net Debt Growth:",
        incomeGrowth: "Income Growth",
        revenueGrowthIncome: "Revenue Growth:",
        ebitdaGrowth: "EBITDA Growth:",
        operatingIncomeGrowth: "Operating Income Growth:",
        epsGrowth: "EPS Growth:"
    },
    zh: {
        title: "自动分析助手",
        pairLabel: "股票/外汇对:",
        periodLabel: "期间:",
        newsLimitLabel: "新闻文章数量:",
        intervalSliderLabel: "间隔（考虑的周期数）:",
        fibonacci: "显示斐波那契",
        elliot: "显示艾略特波浪",
        diagonalLinesLabel: "对角线数量:",
        historyBarsLabel: "历史柱:",
        resolutionLabel: "分辨率（柱）:",
        alphaSliderLabel: "MACD 直方图透明度:",
        fetchData: "获取基本面和顶部新闻",
        fetchChartData: "更新图表",
        fundamentalsTitle: "基本面",
        topNewsTitle: "最新要闻",
        basics: "基础数据",
        marketCap: "市值:",
        eps: "每股收益:",
        peRatio: "市盈率:",
        volume: "成交量:",
        avgVolume: "平均成交量:",
        financialGrowth: "财务增长",
        revenueGrowth: "收入增长:",
        grossProfitGrowth: "毛利润增长:",
        threeYRevenueGrowthPerShare: "3年每股收入增长:",
        threeYOperatingCFGrowthPerShare: "3年每股经营现金流增长:",
        threeYNetIncomeGrowthPerShare: "3年每股净收入增长:",
        cashflowGrowth: "现金流增长",
        netIncomeGrowth: "净收入增长:",
        freeCashFlowGrowth: "自由现金流增长:",
        balanceSheet: "资产负债表",
        shortTermDebtGrowth: "短期债务增长:",
        netDebtGrowth: "净债务增长:",
        incomeGrowth: "收入增长",
        revenueGrowthIncome: "收入增长:",
        ebitdaGrowth: "EBITDA 增长:",
        operatingIncomeGrowth: "经营收入增长:",
        epsGrowth: "每股收益增长:"
    },
    ja: {
        title: "自動分析アシスタント",
        pairLabel: "株式/通貨ペア:",
        periodLabel: "期間:",
        newsLimitLabel: "ニュース記事数:",
        intervalSliderLabel: "間隔（考慮する期間数）:",
        fibonacci: "フィボナッチを表示",
        elliot: "エリオット波動を表示",
        diagonalLinesLabel: "対角線の数:",
        historyBarsLabel: "歴史バー:",
        resolutionLabel: "解像度（バー）:",
        alphaSliderLabel: "MACD ヒストグラムの透明度:",
        fetchData: "ファンダメンタルズとトップニュースを取得",
        fetchChartData: "チャートを更新",
        fundamentalsTitle: "ファンダメンタルズ",
        topNewsTitle: "トップニュース",
        basics: "基本データ",
        marketCap: "時価総額:",
        eps: "EPS:",
        peRatio: "株価収益率:",
        volume: "出来高:",
        avgVolume: "平均出来高:",
        financialGrowth: "財務成長",
        revenueGrowth: "収益成長:",
        grossProfitGrowth: "粗利益成長:",
        threeYRevenueGrowthPerShare: "3年每股収益成長:",
        threeYOperatingCFGrowthPerShare: "3年每股営業キャッシュフロー成長:",
        threeYNetIncomeGrowthPerShare: "3年每股純利益成長:",
        cashflowGrowth: "キャッシュフロー成長",
        netIncomeGrowth: "純利益成長:",
        freeCashFlowGrowth: "フリーキャッシュフロー成長:",
        balanceSheet: "貸借対照表",
        shortTermDebtGrowth: "短期債務成長:",
        netDebtGrowth: "純債務成長:",
        incomeGrowth: "収益成長",
        revenueGrowthIncome: "収益成長:",
        ebitdaGrowth: "EBITDA 成長:",
        operatingIncomeGrowth: "営業利益成長:",
        epsGrowth: "EPS 成長:"
    }
};

// language.js

function updateLanguage(lang) {
    // Update general text
    document.getElementById('title').textContent = translations[lang].title;
    document.getElementById('pairLabel').textContent = translations[lang].pairLabel;
    document.getElementById('periodLabel').textContent = translations[lang].periodLabel;
    document.getElementById('newsLimitLabel').textContent = translations[lang].newsLimitLabel;
    document.getElementById('intervalSliderLabel').textContent = translations[lang].intervalSliderLabel;
    document.getElementById('fibonacci').nextSibling.textContent = translations[lang].fibonacci;
    document.getElementById('elliot').nextSibling.textContent = translations[lang].elliot;
    document.getElementById('diagonalLinesLabel').textContent = translations[lang].diagonalLinesLabel;
    document.getElementById('historyBarsLabel').textContent = translations[lang].historyBarsLabel;
    document.getElementById('resolutionLabel').textContent = translations[lang].resolutionLabel;
    document.getElementById('alphaSliderLabel').textContent = translations[lang].alphaSliderLabel;
    document.getElementById('fetchData').textContent = translations[lang].fetchData;
    document.getElementById('fetchChartData').textContent = translations[lang].fetchChartData;
    document.getElementById('fundamentalsTitle').textContent = translations[lang].fundamentalsTitle;
    document.getElementById('topNewsTitle').textContent = translations[lang].topNewsTitle;

    // Update fundamentals section
    document.querySelector('.data-group.light-grey p:first-child strong').textContent = translations[lang].marketCap;
    document.querySelector('.data-group.light-grey p:nth-child(2) strong').textContent = translations[lang].eps;
    document.querySelector('.data-group.light-grey p:nth-child(3) strong').textContent = translations[lang].peRatio;
    document.querySelector('.data-group.light-grey p:nth-child(4) strong').textContent = translations[lang].volume;
    document.querySelector('.data-group.light-grey p:nth-child(5) strong').textContent = translations[lang].avgVolume;

    document.querySelector('.data-group.light-blue p:first-child strong').textContent = translations[lang].revenueGrowth;
    document.querySelector('.data-group.light-blue p:nth-child(2) strong').textContent = translations[lang].grossProfitGrowth;
    document.querySelector('.data-group.light-blue p:nth-child(3) strong').textContent = translations[lang].threeYRevenueGrowthPerShare;
    document.querySelector('.data-group.light-blue p:nth-child(4) strong').textContent = translations[lang].threeYOperatingCFGrowthPerShare;
    document.querySelector('.data-group.light-blue p:nth-child(5) strong').textContent = translations[lang].threeYNetIncomeGrowthPerShare;

    document.querySelector('.data-group.light-green p:first-child strong').textContent = translations[lang].netIncomeGrowth;
    document.querySelector('.data-group.light-green p:nth-child(2) strong').textContent = translations[lang].freeCashFlowGrowth;
    document.querySelector('.data-group.light-green p:nth-child(3) strong').textContent = translations[lang].shortTermDebtGrowth;
    document.querySelector('.data-group.light-green p:nth-child(4) strong').textContent = translations[lang].netDebtGrowth;

    document.querySelector('.data-group.light-pink p:first-child strong').textContent = translations[lang].revenueGrowthIncome;
    document.querySelector('.data-group.light-pink p:nth-child(2) strong').textContent = translations[lang].ebitdaGrowth;
    document.querySelector('.data-group.light-pink p:nth-child(3) strong').textContent = translations[lang].operatingIncomeGrowth;
    document.querySelector('.data-group.light-pink p:nth-child(4) strong').textContent = translations[lang].epsGrowth;
}
// Event listener for language change
document.getElementById('language').addEventListener('change', function() {
    const selectedLanguage = this.value;
    updateLanguage(selectedLanguage);
});

// Initialize with default language
updateLanguage('en');
