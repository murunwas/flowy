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

FUNC.me = () => {
  return "meeeeeeeee";
};

FUNC.getAll = () => {
  return "meeeeeeeee";
};
