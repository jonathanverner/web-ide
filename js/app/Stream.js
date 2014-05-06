function Stream(name) {
    this.name = name;
    this.write = function (data) {
        $.publish(this.name, data);
    }
    this.flush = function () {};
    this.close = function () {};
    this.readline = function () {};
}
