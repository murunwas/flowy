FUNC.DFtoSeries = (df, seriesname) => {
  return df
    .deflate((x) => x[seriesname])
    .map((x) => x || NaN)
    .toArray();
};

FUNC.getChartOptions = (series, dates) => {
  return {
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 50,
      },
      {
        start: 0,
        end: 50,
      },
    ],
    xAxis: {
      type: "category",
      data: dates,
    },
    yAxis: [
      {
        name: "1h",
        scale: true,
        splitArea: {
          show: true,
        },
      },
    ],
    series,
  };
};
