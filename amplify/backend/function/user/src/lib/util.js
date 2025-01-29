class ProxyResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    };
    this.body = "";
  }
  json(data) {
    this.body = JSON.stringify(data);
    return this;
  }
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }
  send() {
    return this;
  }
}
module.exports = { ProxyResponse };
