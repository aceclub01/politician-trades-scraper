// macd.js

// Function to calculate MACD
export function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
    const shortEMA = calculateEMA(data, shortPeriod);
    const longEMA = calculateEMA(data, longPeriod);
    const macdLine = shortEMA.map((value, index) => value - longEMA[index]);
    const signalLine = calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((value, index) => value - signalLine[index]);

    return { macdLine, signalLine, histogram };
}

// Function to calculate Exponential Moving Average (EMA)
function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    const ema = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            sum += data[i].close;
            ema.push(null); // Not enough data for EMA
        } else {
            const prevEMA = ema[i - 1] || (sum / period);
            const currentEMA = (data[i].close - prevEMA) * k + prevEMA;
            ema.push(currentEMA);
        }
    }

    return ema;
}