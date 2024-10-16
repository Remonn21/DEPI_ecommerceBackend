class CustomError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
  }

  create(message, statusCode, statusText) {
    this.message = message;
    this.statusCode = statusCode;
    this.statusText = statusText;
    return this;
  }
}

export default new CustomError();
