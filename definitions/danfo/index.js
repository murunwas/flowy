const dfd = require("danfojs-node");
const { DataFrame, Series } = require("data-forge");

class Marker {
  constructor(df) {
    this.df = df;
  }
  minima() {
    const markPoints = new DataFrame(dfd.toJSON(this.df))
      .rollingWindow(2)
      .select((x) => {
        const current = x.last();
        const first = x.first();

        const isBuy = first.smin == first.min;
        const isCurr =
          current.smin > current.min && current.close > current.smin;

        return {
          index: current.date,
          data: isBuy && isCurr,
          close: current.close,
        };
      })
      .where((x) => x.data)
      .select((x) => {
        return {
          name: "B",
          value: 100,
          xAxis: x.index,
          yAxis: x.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        };
      })
      .toArray();
    return markPoints;
  }
  grid() {
    const markPoints = new DataFrame(dfd.toJSON(this.df))
      .rollingWindow(2)
      .select((x) => {
        const current = x.last();
        const first = x.first();

        const isBuy = first.smin == first.min;
        const isCurr =
          current.smin > current.min && current.close > current.smin;

        return {
          index: current.date,
          data: isBuy && isCurr,
          close: current.close,
        };
      })
      .where((x) => x.data)
      .select((x) => {
        return {
          name: "B",
          value: 100,
          xAxis: x.index,
          yAxis: x.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        };
      })
      .toArray();
    return markPoints;
  }

  s2Buy() {
    const markPoints = new DataFrame(dfd.toJSON(this.df))
      .where((x) => x.s2Buy)
      .select((x) => {
        return {
          name: "B",
          value: 100,
          xAxis: x.date,
          yAxis: x.close,
          itemStyle: { color: "rgb(92, 123, 217)" },
        };
      })
      .toArray();
    return markPoints;
  }
}

class Data {
  constructor(ohlcv) {
    this.df = new dfd.DataFrame(ohlcv);
    this.df.setIndex({ column: "date", inplace: true });
  }

  addMinima(emaPeriod = 5) {
    const decimals = this.df["close"].iat(0).countDecimals();
    let minS2 = null;
    let minPivot = null;
    let hasS2TouchMinS2 = false;
    let hasMoveAboveMin = false;
    let closeTochMin = false;

    const closes = this.df["close"].values.map((val, i) => {
      if (i < emaPeriod)
        return {
          min: null,
          mean: null,
          max: null,
          smean: null,
          smin: null,
          smax: null,
          pivot: null,
          s1: null,
          r1: null,
          s2: null,
          minS2: null,
          minPivot: null,
          s2Buy: false,
        };
      const high = this.df["high"].iat(i);
      const low = this.df["low"].iat(i);
      const close = this.df["close"].iat(i);

      const pivot = +((high + close + low) / 3).toFixed(decimals);
      const r1 = +(2 * pivot - low).toFixed(decimals);
      const s1 = +(2 * pivot - high).toFixed(decimals);
      const s2 = +(pivot - (high - low)).toFixed(decimals);
      minS2 = +(minS2 == null ? s2 : minS2 < s2 ? minS2 : s2).toFixed(decimals);
      minPivot = +(
        minPivot == null ? pivot : minPivot < pivot ? minPivot : pivot
      ).toFixed(decimals);

      const ss = this.df["close"].iloc([`${0}:${i + 1}`]);
      const mean = +ss.mean().toFixed(decimals);
      const min = +ss.min().toFixed(decimals);
      const max = +ss.max().toFixed(decimals);

      const closeDf = this.df["close"].iloc([`${i - emaPeriod}:${i + 1}`]);
      //console.log(`${i - emaPeriod}:${i}`);
      const smean = +closeDf.mean().toFixed(decimals);
      const smin = +closeDf.min().toFixed(decimals);
      const smax = +closeDf.max().toFixed(decimals);

      if (s2 == minS2 && hasS2TouchMinS2 == false && close == min) {
        hasS2TouchMinS2 = true;
        closeTochMin = true;
      }

      // if (hasS2TouchMinS2 && close == min) {
      //   closeTochMin = true;
      // }

      if (hasS2TouchMinS2 && s2 >= min && closeTochMin) {
        hasMoveAboveMin = true;
      }

      const s2Buy =
        hasS2TouchMinS2 == true &&
        hasMoveAboveMin == true &&
        closeTochMin == true;

      if (s2Buy) {
        hasS2TouchMinS2 = false;
        hasMoveAboveMin = false;
        closeTochMin = false;
      }

      return {
        min,
        mean,
        max,
        smean,
        smin,
        smax,
        pivot,
        r1,
        s1,
        s2,
        minS2,
        minPivot,
        s2Buy,
      };
    });

    const setColumn = (name) => {
      this.df.addColumn(
        name,
        closes.map((x) => x[name]),
        { inplace: true },
      );
    };

    setColumn("mean");
    setColumn("min");
    setColumn("max");

    setColumn("smean");
    setColumn("smin");
    setColumn("smax");
    setColumn("pivot");
    setColumn("s1");
    setColumn("r1");
    setColumn("s2");
    setColumn("minS2");
    setColumn("minPivot");
    setColumn("s2Buy");
    return this;
  }

  filterDataByDate(column, from_date, to_date) {
    if (from_date)
      this.df = this.df.loc({
        rows: this.df[column].apply((x) => x >= from_date),
      });
    if (to_date)
      this.df = this.df.loc({
        rows: this.df[column].apply((x) => x <= to_date),
      });

    return this.df;
  }

  toEchart(columns = ["close", "mean", "min", "max"]) {
    const dates = this.df["date"].values;
    const df = this.df.loc({ columns: [...columns, "date"] });
    const dfObj = dfd.toJSON(df, {
      format: "row",
    });

    const markPoints = new Marker(this.df).s2Buy();

    //console.log(markPoints[0]);

    const series = Object.keys(dfObj)
      .filter((x) => x != "date")
      .map((x, i) => {
        return {
          name: x,
          data: dfObj[x],
          type: "line",
          smooth: true,
          markPoint: {
            data: i == 0 ? markPoints : null,
          },
        };
      });

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
  }

  toJson() {
    return dfd.toJSON(this.df);
  }
}

FUNC.ddd = async function (coin = "sui", timeframe = "1d", chart = true) {
  const data = await FUNC.getHistoricalOHLCData(
    coin,
    timeframe,
    "2023-08-01",
    "month",
  );

  const api = new Data(data).addMinima(10);
  // const res = df
  //   .filterDataByDate("date", "2023-10-10 10:00", "2023-10-11 14:00")
  //   .loc({ columns: ["date", "close", "mean", "min", "max"] });
  // return dfd.toJSON(api.df.tail(), {
  //   format: "row",
  // });
  if (!chart) {
    return api.toJson();
  }
  return api.toEchart([
    "close",
    "min",
    // "smin",
    //"max",
    //"smax",
    //"mean",
    "pivot",
    // "s1",
    // "r1",
    "s2",
    "minS2",
    "minPivot",
  ]);
};
