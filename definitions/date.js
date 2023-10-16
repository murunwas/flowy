const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Africa/Johannesburg";

dayjs.tz.setDefault(TIMEZONE);

FUNC.getDate = function (date) {
  if (date) {
    return dayjs(date).tz(TIMEZONE);
  }
  return dayjs().tz(TIMEZONE);
};

FUNC.formatDate = function (date, formatter = "YYYY-MM-DD HH:mm") {
  if (date) {
    return FUNC.getDate(date).format(formatter);
  }
  return FUNC.getDate().format(formatter);
};

FUNC.startOf = function (time = "day", date) {
  if (date) return dayjs(date).tz(TIMEZONE).startOf(time).toISOString();
  return dayjs().tz(TIMEZONE).startOf(time).toISOString();
};

FUNC.endOf = function (time = "day", date) {
  if (date) return dayjs(date).tz(TIMEZONE).endOf(time).toISOString();
  return dayjs().tz(TIMEZONE).endOf(time).toISOString();
};

FUNC.unix = function (unixdate, formatter = "YYYY-MM-DD HH:mm") {
  return dayjs.unix(unixdate).tz(TIMEZONE).format(formatter);
};

FUNC.subtractMonth = function (noOfmonts = 1, formatter = "YYYY-MM-DD HH:mm") {
  const date = dayjs().subtract(noOfmonts, "month");
  return FUNC.getDate(date).tz(TIMEZONE).startOf("month").format(formatter);
};
