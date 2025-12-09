export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    errors?: any;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
}

const buildResponse = (statusCode: number, body: object) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
});

export const successResponse = <T>(message: string, data?: T, statusCode: number = 200) => {
    return buildResponse(statusCode, { message, data });
};

export const errorResponse = (message: string, errors?: any, statusCode: number = 500) => {
    return buildResponse(statusCode, { message, errors });
};

export const validationResponse = (message: string, errors?: any) => {
    return buildResponse(400, { message, errors });
};

export const conflictResponse = (message: string) => {
    return buildResponse(409, { message });
};


//CUSTOM ERROR FUNCTIONS

// Not Found
export const NotFoundError = (message: string) => ({
    type: "NotFoundError",
    message,
    statusCode: 404,
});

// Validation
export const BadRequestError = (message: string) => ({
    type: "BadRequestError",
    message,
    statusCode: 400,
});

// Conflict
export const ConflictError = (message: string) => ({
    type: "ConflictError",
    message,
    statusCode: 409,
});

// Unauthorized
export const UnauthorizedError = (message: string) => ({
    type: "UnauthorizedError",
    message,
    statusCode: 401,
});

// Forbidden
export const ForbiddenError = (message: string) => ({
    type: "ForbiddenError",
    message,
    statusCode: 403,
});
