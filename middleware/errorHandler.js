const errorHandler = (error, req, res, next) => {
  if (error.statusCode === 500 || !error.statusCode) console.log("ERROR:", error);

  res.status(error.statusCode || 500).json({
    status: error.statusText || "Error",
    message: error.message,
    code: error.statusCode || 500,
    data: null,
    err: error.statusCode
      ? {
          message: error.message,
          statusCode: error.statusCode,
          statusText: error.statusText,
          stack: error.stack,
          ...error,
        }
      : "",
  });
};

export default errorHandler;
