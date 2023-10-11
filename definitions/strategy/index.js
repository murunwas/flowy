FUNC.RateOfChange = (data = []) => {
  return data;
};
FUNC.RateOfChanges = (d) => d;

FUNC.sum = (a, b) => {
  return a + b;
};

FUNC.wickSniper = function (df, threshold = 1.5) {
  const diff = (c) => {
    const difference = c.min - c.low;
    return (difference / c.min) * 100;
  };
  return df.generateSeries({
    isWickSniper: (c) => diff(c) >= threshold,
  });
};
