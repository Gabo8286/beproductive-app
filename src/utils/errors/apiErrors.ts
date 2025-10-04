export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return new ApiError(
      error.response.status,
      error.response.data?.code || "SERVER_ERROR",
      error.response.data?.message || "An error occurred on the server",
      error.response.data?.details,
    );
  } else if (error.request) {
    // Network error - request made but no response
    return new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to connect to the server. Please check your internet connection.",
      { originalError: error },
    );
  } else {
    // Client-side error
    return new ApiError(
      0,
      "CLIENT_ERROR",
      error.message || "An unexpected error occurred",
      { originalError: error },
    );
  }
};

// User-friendly error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  AUTH_EXPIRED: "Your session has expired. Please log in again.",
  AUTH_REQUIRED: "Please log in to continue.",
  PERMISSION_DENIED: "You don't have permission to perform this action.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  NOT_FOUND: "The requested resource was not found.",
  NETWORK_ERROR: "Connection problem. Please check your internet.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  TIMEOUT: "Request timed out. Please try again.",
  CONFLICT: "This action conflicts with existing data.",
  QUOTA_EXCEEDED: "You have exceeded your usage quota.",
};

export const getErrorMessage = (error: ApiError | Error): string => {
  if (ApiError.isApiError(error)) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  return error.message || "An unexpected error occurred";
};

export const getErrorTitle = (error: ApiError | Error): string => {
  if (ApiError.isApiError(error)) {
    switch (error.code) {
      case "AUTH_EXPIRED":
      case "AUTH_REQUIRED":
        return "Authentication Required";
      case "PERMISSION_DENIED":
        return "Permission Denied";
      case "RATE_LIMITED":
        return "Too Many Requests";
      case "VALIDATION_ERROR":
        return "Validation Error";
      case "NOT_FOUND":
        return "Not Found";
      case "NETWORK_ERROR":
        return "Connection Error";
      case "SERVER_ERROR":
        return "Server Error";
      default:
        return "Error";
    }
  }
  return "Error";
};

export const isRetryable = (error: ApiError | Error): boolean => {
  if (ApiError.isApiError(error)) {
    return [
      "NETWORK_ERROR",
      "TIMEOUT",
      "SERVER_ERROR",
      "RATE_LIMITED",
    ].includes(error.code);
  }
  return false;
};
