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
  symbol = "BCH/USDT",
  timeframe = "1h",
  startDate = "2023-08-01",
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

FUNC.toDF = function (data) {
  let df = new DataFrame(data).setIndex("date");

  df = FUNC.minima(df);
  df = FUNC.minlowPercentage(df);
  df = FUNC.zscore(df);
  //df = FUNC.minGap(df);
  //df = FUNC.zscores(df)

  return df;
};
