const { DataFrame, Series } = require("data-forge");
const ss = require("data-forge-indicators");

FUNC.rsi = function (df, period = 14, name = "rsi") {
  const rsi = df.deflate((row) => row.close).rsi(period);
  df = df.withSeries(name, rsi).bake();
  return df;
};

FUNC.last5Touches = function (df, period = 10) {
  const zscoreSeries = df
    .rollingWindow(period)
    .select((x) => {
      const current = x.last();
      const hasTouched = x.any((curr) => curr?.close < curr?.min);
      return { index: current.date, data: hasTouched };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("hasTouched", zscoreSeries);
  return df;
};

FUNC.smaBuy = function (df) {
  // df = FUNC.last5Touches(df);
  const zscoreSeries = df
    .rollingWindow(2)
    .select((x) => {
      const current = x.last();
      const first = x.first();

      // const isBuy = first.close < first.mean && current.close > current.mean;
      // const isSMABelow =
      //   current.sma20 < current.mean && current.sma50 < current.mean;

      const isBuy = first.sma20 < first.sma50 && current.sma20 > current.sma50;
      const upperBandDistance = Math.abs(current.close - current.mean);
      const lowerBandDistance = Math.abs(current.close - current.min);

      return {
        index: current.date,
        data: isBuy && lowerBandDistance < upperBandDistance,
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("isSmaBuy", zscoreSeries);
  return df;
};

FUNC.isCurvedBuy = function (df) {
  const zscoreSeries = df
    .rollingWindow(5)
    .select((x) => {
      const current = x.last();
      const first = x.first();
      const arr = x.toArray();
      const [f, two, middle, fourth, l] = arr;

      const hasSma50 = x.all((dd) => dd.sma50 > 0);

      const { any } = arr.reduce(
        (acc, curr) => {
          if (acc.any) return acc;
          if (acc.prev) {
            acc.any =
              acc.prev.close < acc.prev.sma20 && curr.close > curr.sma20;
          }
          acc.prev = curr;
          return acc;
        },
        {
          prev: null,
          any: false,
        },
      );

      const decreseMomentum =
        first.sma20 > two.sma20 && two.sma20 > middle.sma20;
      const increaseMomentum =
        middle.sma20 < fourth.sma20 && fourth.sma20 < current.sma20;

      const upperBandDistance = Math.abs(current.close - current.mean);
      const lowerBandDistance = Math.abs(current.close - current.min);

      return {
        index: current.date,
        data:
          decreseMomentum &&
          increaseMomentum &&
          any &&
          hasSma50 &&
          lowerBandDistance < upperBandDistance &&
          current.close < current.mean,
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("isCurvedBuy", zscoreSeries);
  return df;
};

FUNC.hasCrossedSMA = function (df) {
  // df = FUNC.last5Touches(df);
  const zscoreSeries = df
    .rollingWindow(2)
    .select((x) => {
      const current = x.last();
      const first = x.first();

      const isBuy = first.sma9 < first.smaMin && current.sma9 > current.smaMin;

      return {
        index: current.date,
        data: isBuy,
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("hasCrossedSMA", zscoreSeries);
  return df;
};
