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
}

class Data {
  constructor(ohlcv) {
    this.df = new dfd.DataFrame(ohlcv);
    this.df.setIndex({ column: "date", inplace: true });
  }

  addMinima(emaPeriod = 10) {
    const decimals = this.df["close"].iat(0).countDecimals();
    const closes = this.df["close"].values.map((val, i) => {
      if (i < emaPeriod)
        return {
          min: null,
          mean: null,
          max: null,
          smean: null,
          smin: null,
          smax: null,
        };
      const ss = this.df["close"].iloc([`${0}:${i}`]);
      const mean = +ss.mean().toFixed(decimals);
      const min = +ss.min().toFixed(decimals);
      const max = +ss.max().toFixed(decimals);

      const closeDf = this.df["close"].iloc([`${i - emaPeriod}:${i}`]);
      //console.log(`${i - emaPeriod}:${i}`);
      const smean = +closeDf.mean().toFixed(decimals);
      const smin = +closeDf.min().toFixed(decimals);
      const smax = +closeDf.max().toFixed(decimals);

      return { min, mean, max, smean, smin, smax };
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

    const markPoints = new Marker(this.df).minima();

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
}

FUNC.ddd = async function (coin = "sui", timeframe = "1h") {
  const data = await FUNC.getHistoricalOHLCData(
    coin,
    timeframe,
    FUNC.subtractMonth(),
    "month",
  );

  const api = new Data(data).addMinima(3);
  // const res = df
  //   .filterDataByDate("date", "2023-10-10 10:00", "2023-10-11 14:00")
  //   .loc({ columns: ["date", "close", "mean", "min", "max"] });
  // return dfd.toJSON(api.df.tail(), {
  //   format: "row",
  // });
  return api.toEchart(["close", "min", "smin", "max", "smax", "mean"]);
};
