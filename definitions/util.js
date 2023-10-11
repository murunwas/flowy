const ccxt = require("ccxt");
const { DataFrame, Series } = require("data-forge");
FUNC.STRATEGIES = new Map();

require("./api/binance");
require("./app");
require("./date");
require("./indicators");
require("./algo");
require("./lib");
require("./strategy");

FUNC.getStrategy = (name = "RateOfChange", ...args) => {
  if (name in FUNC && typeof FUNC[name] === "function") {
    return FUNC[name](...args);
  }
  return "Not Exist...";
};
