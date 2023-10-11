FUNC.isAboveMax = function (df) {
  // df = FUNC.last5Touches(df);
  const zscoreSeries = df
    .rollingWindow(2)
    .select((x) => {
      const current = x.last();
      const first = x.first();

      const isBuy = first.close > first.max;

      return {
        index: current.date,
        data: isBuy,
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("isAboveMax", zscoreSeries);
  return df;
};
