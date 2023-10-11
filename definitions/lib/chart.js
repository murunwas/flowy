FUNC.DFtoEchart = function (data = []) {
  //return {rsi:x?.rsi||null, baseRsi:x.base?.rsi||null,date:x.date}
  const d = data.reduce(
    (acc, curr) => {
      acc.rsis.push(curr?.close || null);
      acc.minlow.push(curr?.min || null);
      acc.highs.push(curr?.max || null);
      acc.averages.push(curr?.average || null);
      acc.dates.push(curr.date);
      if (
        curr?.close < curr?.min &&
        (acc.last == null || acc.last == "lower") &&
        acc.rsis.length > 5
      ) {
        acc.amountBought = +(100 / curr.close).toFixed(2);
        acc.markPoints.push({
          name: "B",
          value: 100,
          xAxis: curr.date,
          yAxis: curr?.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        });

        acc.last = "upper";
      } else if (acc.last == "upper" && acc.amountBought * curr.close > 102) {
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
      minlow: [],
      highs: [],
      dates: [],
      rsis: [],
      averages: [],
      markPoints: [],
      last: null,
      amountBought: 0,
    },
  );
  //console.log(d.markPoints);
  return {
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 10,
      },
      {
        start: 0,
        end: 10,
      },
    ],
    xAxis: {
      type: "category",
      data: d.dates,
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
    series: [
      {
        name: "normal",
        data: d.rsis,
        type: "line",
        smooth: true,
        markPoint: {
          data: d.markPoints,
        },
      },
      {
        name: "low",
        data: d.minlow,
        type: "line",
        smooth: true,
      },
      {
        name: "high",
        data: d.highs,
        type: "line",
        smooth: true,
      },
      {
        name: "average",
        data: d.averages,
        type: "line",
        smooth: true,
      },
    ],
  };
};

FUNC.zscoreToEchart=(data=[])=>{
    const dd = res.reduce((acc, x) => {},{
        
    })
}
