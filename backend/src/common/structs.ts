import { HttpResponseProps } from "./interfaces";

/**
 * Represents an exception with an associated HTTP status code.
 */
export class Exception extends Error {
    /**
     * The HTTP status code associated with the exception.
     */
    statusCode: number;

    /**
     * Creates a new instance of the Exception class.
     * @param message A description of the exception.
     * @param statusCode The HTTP status code associated with the exception.
     */
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Represents an HTTP response with optional data, error code, and message.
 * @typeparam T The type of data contained in the response.
 */
export class HttpResponse<T = any> {
    /**
     * The data contained in the response.
     */
    data?: T;
    
    /**
     * The error code associated with the response.
     */
    errorCode?: number;
    
    /**
     * A descriptive message associated with the response.
     */
    message?: string;
    
    /**
     * Indicates whether the response was successful.
     */
    success?: boolean;

    /**
     * Creates a new instance of the HttpResponse class.
     * @param params An object containing properties for initializing the response.
     * @param params.success Indicates whether the response was successful.
     * @param params.data The data contained in the response.
     * @param params.errorCode The error code associated with the response.
     * @param params.message A descriptive message associated with the response.
     */
    constructor({ success, data, errorCode, message }: HttpResponseProps) {
        this.data = data;
        this.errorCode = errorCode;
        this.message = message;
        this.success = success;
    }
}
