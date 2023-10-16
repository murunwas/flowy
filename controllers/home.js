exports.install = function () {
  ROUTE("GET /home/", login);
  ROUTE("GET /home/dd", function () {
    this.plain(FUNC.subtractMonth());
  });
};

function login() {
  this.view("home");
}
