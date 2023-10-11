require("./chart");

FUNC.toEchart = function (data = []) {
  //return {rsi:x?.rsi||null, baseRsi:x.base?.rsi||null,date:x.date}
  const d = data.reduce(
    (acc, curr) => {
      acc.base.push(curr.base?.rsi?.toFixed(0) || null);
      acc.rsis.push(curr?.rsi?.toFixed(0) || null);
      acc.dates.push(curr.date);
      if (
        curr.base?.rsi <= 30 &&
        curr?.rsi > curr.base?.rsi &&
        (acc.last == null || acc.last == "lower")
      ) {
        const percentageGap =
          Math.abs((curr.base?.rsi - curr?.rsi) / curr.base?.rsi) * 100;
        if (percentageGap <= 50) {
          acc.amountBought = +(100 / curr.close).toFixed(2);
          acc.markPoints.push({
            name: "B",
            value: 100,
            xAxis: curr.date,
            yAxis: curr?.rsi,
            itemStyle: { color: "rgb(92, 123, 217)" },
          });

          acc.last = "upper";
        }
      } else if (acc.last == "upper" && acc.amountBought * curr.close > 102) {
        acc.markPoints.push({
          name: "ss",
          value: +(acc.amountBought * curr.close).toFixed(2),
          xAxis: curr.date,
          yAxis: curr?.rsi,
          itemStyle: { color: "rgb(159, 224, 128)" },
        });
        acc.last = "lower";
      }
      return acc;
    },
    {
      base: [],
      dates: [],
      rsis: [],
      markPoints: [],
      last: null,
      amountBought: 0,
    },
  );

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
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "base",
        data: d.base,
        type: "line",
        smooth: true,
      },
      {
        name: "normal",
        data: d.rsis,
        type: "line",
        smooth: true,
        markPoint: {
          data: d.markPoints,
        },
      },
    ],
  };
};

FUNC.minimaToEchart = function (data = []) {
  //return {rsi:x?.rsi||null, baseRsi:x.base?.rsi||null,date:x.date}
  const d = data.reduce(
    (acc, curr) => {
      acc.rsis.push(curr?.close || null);
      acc.minlow.push(curr?.minlow || null);
      acc.dates.push(curr.date);
      if (
        curr.isBelowMin &&
        curr?.rsi < 30 &&
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
    yAxis: {
      type: "value",
    },
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
    ],
  };
};

FUNC.aboveMaxToEchart = function (data = []) {
  //return {rsi:x?.rsi||null, baseRsi:x.base?.rsi||null,date:x.date}
  const d = data.reduce(
    (acc, curr) => {
      acc.rsis.push(curr?.close || null);
      acc.minlow.push(curr?.max || null);
      acc.dates.push(curr.date);
      if (
        curr.isAboveMAx &&
        curr?.rsi < 30 &&
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
    yAxis: {
      type: "value",
    },
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
    ],
  };
};

FUNC.wickToEchart = function (data = []) {
  //return {rsi:x?.rsi||null, baseRsi:x.base?.rsi||null,date:x.date}
  const d = data.reduce(
    (acc, curr) => {
      acc.rsis.push(curr?.close || null);
      acc.minlow.push(curr?.min || null);
      acc.highs.push(curr?.max || null);
      acc.dates.push(curr.date);
      if (
        curr.isWickSniper &&
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
    ],
  };
};
