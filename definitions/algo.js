const { DataFrame, Series } = require("data-forge");
const ss = require("simple-statistics");
require("data-forge-indicators");

FUNC.zscore = function (df, period = 5) {
  const zscoreSeries = df
    .rollingWindow(period)
    .select((x) => {
      const c = x.last();
      //const closePrices = x.head(period - 1).deflate(s => s.close)
      const closePrices = x.deflate((s) => s.close);
      const mean = closePrices.mean(); // Calculate mean
      const standardDeviation = closePrices.std();
      const lastClosePrice = c.close;
      const zScore = (lastClosePrice - mean) / standardDeviation;
      return { index: c.date, data: zScore };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("zscore", zscoreSeries);
  return df;
};

FUNC.zscores = function (df, period = 5) {
  const zscoreSeries = df
    .rollingWindow(period)
    .select((x) => {
      const c = x.last();
      const closePrices = x.deflate((s) => s.close);
      const mean = ss.mean(closePrices.toArray());
      const standardDeviation = ss.standardDeviation(closePrices.toArray());
      const lastClosePrice = c.close;
      return {
        index: c.date,
        data: ss.zScore(lastClosePrice, mean, standardDeviation),
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("zscores", zscoreSeries);
  return df;
};

FUNC.minlowPercentage = function (df) {
  return df.generateSeries({
    minlowPercentage: (c) => (c.low - c.minlow) / (c.min - c.minlow),
    mingapPercentage: (c) => (c.close - c.minlow) / (c.min - c.minlow),
    maxHighPercentage: (c) => (c.high - c.maxhigh) / (c.max - c.maxhigh),
    isMinlowGap: (c) => c.minlowPercentage <= 0 && isFinite(c.minlowPercentage),
    isMaxHighGap: (c) =>
      c.maxHighPercentage <= 0 && isFinite(c.maxHighPercentage),
    isminGap: (c) => c.mingapPercentage <= 0 && isFinite(c.mingapPercentage),
  });
};

FUNC.minima = function (df) {
  const dataArr = df.toArray();
  const records = dataArr.reduce(
    (accumulator, current) => {
      if (current !== undefined) {
        const min = Math.min(
          ...accumulator.itemsFromCurrentIndex.map((x) => x.close),
        );
        const minLow = Math.min(
          ...accumulator.itemsFromCurrentIndex.map((x) => x.low),
        );
        const max = Math.max(
          ...accumulator.itemsFromCurrentIndex.map((x) => x.close),
        );
        const maxHigh = Math.max(
          ...accumulator.itemsFromCurrentIndex.map((x) => x.high),
        );
        const average = new Series(
          accumulator.itemsFromCurrentIndex.map((x) => x.close),
        ).average();
        const mean = (max + min) / 2;

        accumulator.itemsFromCurrentIndex.push(current);

        accumulator.records.push({
          date: current.date,
          min,
          max,
          minLow,
          maxHigh,
          average,
          mean,
        });
      }

      return accumulator;
    },
    { itemsFromCurrentIndex: [], records: [] },
  ).records;
  const series = new Series({
    index: records.map((x) => x.date),
    values: records.map((x) => {
      const { date, ...rest } = x;
      return { ...rest };
    }),
  });
  df = df.withSeries("minMax", series);

  df = df.generateSeries({
    min: (c) => c.minMax?.min,
    minlow: (c) => c.minMax?.minLow,
    max: (c) => c.minMax?.max,
    maxhigh: (c) => c.minMax?.maxHigh,
    average: (c) => c.minMax?.average,
    mean: (c) => c.minMax?.mean,
    isBelowMin: (c) => c.close < c.minMax?.min,
    isBelowMinLow: (c) => c.low < c.minMax?.minlow,
    isAboveMAx: (c) => c.close > c.minMax?.max,
    isAboveMaxHigh: (c) => c.high > c.minMax?.maxHigh,
  });

  return df.dropSeries("minMax");
};

FUNC.smaMinima = function (df) {
  const dataArr = df.toArray();
  const records = dataArr.reduce(
    (accumulator, current) => {
      if (current !== undefined) {
        const min = Math.min(
          ...accumulator.itemsFromCurrentIndex
            .filter((x) => typeof x?.sma9 == "number")
            .map((x) => x?.sma9),
        );

        const max = Math.max(
          ...accumulator.itemsFromCurrentIndex
            .filter((x) => typeof x?.sma50 == "number")
            .map((x) => x?.sma50),
        );

        accumulator.itemsFromCurrentIndex.push(current);

        accumulator.records.push({
          date: current.date,
          min,
          max,
        });
      }

      return accumulator;
    },
    { itemsFromCurrentIndex: [], records: [] },
  ).records;
  const series = new Series({
    index: records.map((x) => x.date),
    values: records.map((x) => {
      const { date, ...rest } = x;
      return { ...rest };
    }),
  });
  df = df.withSeries("smaMinima", series);

  df = df.generateSeries({
    smaMin: (c) => c.smaMinima?.min,
    smaMax: (c) => c.smaMinima?.max,
  });

  return df.dropSeries("smaMinima");
};

FUNC.sma = function sma(df, period = 21, key = "close") {
  const maHigh = df
    .deflate((bar) => bar[key])
    .sma(period)
    .bake();

  df = df.withSeries(`sma${period}`, maHigh).bake();
  return df;
};
