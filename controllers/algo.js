exports.install = function () {
  ROUTE("GET /api/algo/{coin}/{timeframe}", getTopData);
  ROUTE("GET /api/algo/{coin}/{timeframe}/json", async function () {
    const { coin, timeframe } = this.params;
    const data = await FUNC.ddd(coin, timeframe);
    this.json(data);
  });
};

async function getData() {
  const { coin, timeframe } = this.params;
  const data = await FUNC.getHistoricalOHLCData(
    coin,
    timeframe,
    "2023-09-05",
    "month",
  );
  let df = FUNC.toDF(data);
  df = FUNC.last5Touches(df, 10);
  df = FUNC.smaMinima(df);
  df = FUNC.hasCrossedSMA(df);
  const dates = FUNC.DFtoSeries(df, "date");
  const INITIAL = 100;
  // return this.json(df.toArray());
  const series = [
    "close",
    "sma9",
    // "sma20",
    // "sma50",
    "min",
    "max",
    // "mean",
    "smaMin",
    // "smaMax",
  ].map((x) => ({
    name: x,
    data: FUNC.DFtoSeries(df, x),
    type: "line",
    smooth: true,
  }));

  const { markPoints } = df.reduce(
    (acc, curr) => {
      if (
        curr.hasCrossedSMA &&
        curr.hasTouched &&
        (acc.last == null || acc.last == "lower")
      ) {
        acc.amountBought = +(INITIAL / curr.close).toFixed(2);
        acc.markPoints.push({
          name: "B",
          value: INITIAL,
          xAxis: curr.date,
          yAxis: curr?.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        });

        acc.last = "upper";
      } else if (
        (acc.last == "upper" && curr.close > curr.max) ||
        (acc.last == "upper" && acc.amountBought * curr.close > INITIAL + 3)
      ) {
        acc.markPoints.push({
          name: "ss",
          value: +(acc.amountBought * curr.close).toFixed(2),
          xAxis: curr.date,
          yAxis: curr?.close,
          itemStyle: { color: "rgb(159, 224, 128)" },
        });
        acc.last = "lower";
      }
      return acc;
    },
    {
      amountBought: 0,
      last: null,
      markPoints: [],
    },
  );

  series[0].markPoint = {
    data: markPoints,
  };
  //
  const option = FUNC.getChartOptions(series, dates);
  this.json(option);
}

async function getTopData() {
  const { coin, timeframe } = this.params;
  const data = await FUNC.getHistoricalOHLCData(
    coin,
    timeframe,
    "2023-09-05",
    "month",
  );
  let df = FUNC.toDF(data);
  df = FUNC.last5Touches(df, 10);
  df = FUNC.smaMinima(df);
  df = FUNC.isAboveMax(df);
  const dates = FUNC.DFtoSeries(df, "date");
  const INITIAL = 100;
  // return this.json(df.toArray());
  const series = [
    "close",
    "sma9",
    // "sma20",
    "sma50",
    // "min",
    "max",
    // "mean",
    //"smaMin",
    "smaMax",
  ].map((x) => ({
    name: x,
    data: FUNC.DFtoSeries(df, x),
    type: "line",
    smooth: true,
  }));

  const { markPoints } = df.reduce(
    (acc, curr) => {
      if (curr.isAboveMax && (acc.last == null || acc.last == "lower")) {
        acc.amountBought = +(INITIAL * curr.close).toFixed(2);
        acc.markPoints.push({
          name: "B",
          value: INITIAL,
          xAxis: curr.date,
          yAxis: curr?.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        });

        acc.last = "upper";
      } else if (acc.last == "upper" && curr.close < curr.mean) {
        const profit = +(acc.amountBought / curr.close - INITIAL).toFixed(2);

        acc.markPoints.push({
          name: "ss",
          value: +(acc.amountBought / curr.close - INITIAL).toFixed(2),
          xAxis: curr.date,
          yAxis: curr?.close,
          itemStyle: { color: "rgb(159, 224, 128)" },
        });
        acc.last = "lower";
      }
      return acc;
    },
    {
      amountBought: 0,
      last: null,
      markPoints: [],
    },
  );

  series[0].markPoint = {
    data: markPoints,
  };
  // (acc.last == "upper" && acc.amountBought * curr.close > INITIAL + 3)
  const option = FUNC.getChartOptions(series, dates);
  this.json(option);
}
