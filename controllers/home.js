exports.install = function () {
  ROUTE("GET /home/", login);
};

function login() {
  this.view("home");
}

