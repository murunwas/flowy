String.prototype.toSymbol = function () {
  if (this.split("/").length < 2) {
    return String(`${this}/USDT`).toUpperCase();
  }
  return this.toUpperCase();
};

String.prototype.startOfDate = function () {
  if (this.split("/").length < 2) {
    return String(`${this}/USDT`).toUpperCase();
  }
  return this.toUpperCase();
};

String.prototype.toPercentage = function () {
  return (Number(this) * 100).toFixed(2);
};

Number.prototype.countDecimals = function () {
  const decimalString = this.toString().split(".")[1];
  return decimalString ? decimalString.length : 0;
};

FUNC.me = () => {
  return "meeeeeeeee";
};

FUNC.getAll = () => {
  return "meeeeeeeee";
};
