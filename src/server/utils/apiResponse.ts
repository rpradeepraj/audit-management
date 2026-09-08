import { NextResponse } from "next/server";

/**
 * Standardized API Response helper for backend controllers.
 */
export class ApiResponse {
  static success<T = any>(data: T, message = "Success", status = 200, headers?: HeadersInit) {
    return NextResponse.json(
      {
        success: true,
        message,
        ...data,
      },
      { status, headers }
    );
  }

  static error(message = "An error occurred", status = 400, errors?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(errors ? { errors } : {}),
      },
      { status }
    );
  }
}

export default ApiResponse;
