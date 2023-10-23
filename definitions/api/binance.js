const ccxt = require("ccxt");
const { DataFrame, Series } = require("data-forge");
const exchange = new ccxt.binance();

FUNC.mapper = function (data, symbol = "", timeframe = "") {
  return data.map((d) => ({
    time: d[0],
    date: FUNC.formatDate(d[0]),
    open: d[1] * 1,
    high: d[2] * 1,
    low: d[3] * 1,
    close: d[4] * 1,
    volume: d[5] * 1,
    symbol,
    timeframe,
  }));
};

FUNC.toDF = function (data) {
  let df = new DataFrame(data).setIndex("date");

  df = FUNC.minima(df);
  df = FUNC.minlowPercentage(df);
  df = FUNC.zscore(df);
  df = FUNC.rsi(df);
  df = FUNC.wickSniper(df, 1.5);
  df = FUNC.sma(df, 20);
  df = FUNC.sma(df, 50);
  df = FUNC.sma(df, 9);

  return df;
};

FUNC.getData = async () => {
  return { name: "T" };
};

FUNC.getOHLCData = async function (symbol = "BCH/USDT", timeframe = "1h") {
  const data = await exchange.fetchOHLCV(
    symbol.toSymbol(),
    timeframe,
    undefined,
    1000,
  );
  return FUNC.mapper(data, symbol, timeframe);
};

FUNC.getHistoricalOHLCData = async function (
  symbol = "KAVA/USDT",
  timeframe = "1h",
  startDate = "2023-08-20",
  startPeriod = "day",
) {
  startDate = FUNC.startOf(startPeriod, startDate);
  const endDate = FUNC.endOf(startPeriod);
  let since = exchange.parse8601(startDate);
  const until = exchange.parse8601(endDate);
  const ohlcv = [];

  while (since < until) {
    const partialOHLCV = await exchange.fetchOHLCV(
      symbol.toSymbol(),
      timeframe,
      since,
      1000,
    );
    if (partialOHLCV.length === 0) {
      break;
    }
    ohlcv.push(...partialOHLCV);
    since = partialOHLCV[partialOHLCV.length - 1][0] + 1;
  }

  return FUNC.mapper(ohlcv, symbol, timeframe);
};

FUNC.getTicker = async function (coin = "sui") {
  return await exchange.fetchTicker(coin.toSymbol());
};

FUNC.multipleCoins = async function (
  coin1 = "KAVA/USDT",
  coin2 = "BTC/USDT",
  timeframe = "1h",
  startDate = "2023-09-19",
  startPeriod = "month",
) {
  const base = await FUNC.getHistoricalOHLCData(
    coin1,
    timeframe,
    startDate,
    startPeriod,
  );
  let baseDf = FUNC.toDF(base);

  const coin2Data = await FUNC.getHistoricalOHLCData(
    coin2,
    timeframe,
    startDate,
    startPeriod,
  );
  let df = FUNC.toDF(coin2Data);

  const coin2Series = df.select((x) => ({
    date: x.date,
    base: {
      isminGap: x.hasMinGap,
      zscore: x.zscore,
      isMinLow: x.close < x.minlow,
      isMaxhigh: x.close > x.max,
      close: x.close,
      rsi: x?.rsi,
    },
  }));
  baseDf = baseDf.merge(coin2Series);

  baseDf = baseDf.generateSeries({
    isBuy: (c) => c.hasMinGap == true && c.base.isminGap == true,
    isBuyZscore: (c) =>
      c.zscore <= -2 &&
      c.base.zscore <= -2 &&
      c.close < c.minlow &&
      c.base.isMinLow,
    isBuyMin: (c) => c.close < c.minlow && c.base.isMinLow,
    isBuyMax: (c) => c.close > c.max && c.base.isMaxhigh,
    isBuyBaseMax: (c) => c.close > c.max,
    spread: (c) => c.base.close - c.close,
  });
  return baseDf.toArray();
};
