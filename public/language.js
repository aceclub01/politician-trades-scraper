// language.js

// Language data
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
        topNewsTitle: "Top News"
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
        topNewsTitle: "顶部新闻"
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
        topNewsTitle: "トップニュース"
    }
};

// Function to update the language
function updateLanguage(lang) {
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
}

// Event listener for language change
document.getElementById('language').addEventListener('change', function() {
    const selectedLanguage = this.value;
    updateLanguage(selectedLanguage);
});

// Initialize with default language
updateLanguage('en');
