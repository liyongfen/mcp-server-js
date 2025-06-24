"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.handleError400 = handleError400;
exports.handleError500 = handleError500;
exports.handleApiError = handleApiError;
function handleError({ status, message, code }, req, res) {
    var _a;
    res.status(status).json({
        jsonrpc: '2.0',
        error: {
            code: code,
            message: message,
        },
        id: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.id,
    });
}
function handleError400(req, res) {
    handleError({
        status: 400,
        code: -32000,
        message: 'Bad Request: No valid session ID provided'
    }, req, res);
}
function handleError500({ code = -32603, message = 'Bad Request: No valid session ID provided' }, req, res) {
    handleError({
        status: 500,
        code: code,
        message: message
    }, req, res);
}
function handleApiError(error) {
    console.error("API Error:", error);
    const errorMessage = error.message || "Unknown error occurred";
    return {
        content: [
            {
                type: "text",
                text: `Error: ${errorMessage}`,
            },
        ],
        isError: true,
    };
}
;
