// Error middleware || NEXT function

const erroMiddleware = (err, req, res, next) => {
  //console.log(err);
  const defaultErrors = {
    statusCode: 500,
    message: err,
  };

  //missing field error
  if (err.name == "ValidatorError") {
    defaultErrors.statusCode = 400;
    defaultErrors.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }
  //duplicate errors
  if (err.code && err.code === 11000) {
    defaultErrors.statusCode = 400;
    defaultErrors.message = `${Object.keys(
      err.keyValue
    )} field has to be unique`;
  }
  res.status(defaultErrors.statusCode).json({ message: defaultErrors.message });
};

export default erroMiddleware;
