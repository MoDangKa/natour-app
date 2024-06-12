class CustomError extends Error {
  statusCode: number;
  status: string;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = errors;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
