class CustomError extends Error {
  statusCode: number;
  status: string;
  error?: any;
  isOperational: boolean;

  constructor(message: string, statusCode: number, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
