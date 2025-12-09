class ExpressError extends Error {
  constructor(message = "Something went wrong", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
