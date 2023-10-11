FUNC.minSma =(df)=>{
  const res={
    touch:false
  }
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

      return {
        index: current.date,
        data:
          decreseMomentum &&
          increaseMomentum &&
          any &&
          hasSma50 &&
          current.close < current.mean,
      };
    })
    .withIndex((x) => x.index)
    .select((x) => x.data);

  df = df.withSeries("isCurvedBuy", zscoreSeries);
  return df;
}