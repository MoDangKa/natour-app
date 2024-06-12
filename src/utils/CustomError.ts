class CustomError extends Error {
  statusCode: number;
  errors?: any;
  isOperational: boolean;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this.constructor);
  }
}

export default CustomError;
