export function handleError({status, message, code}: any, req: any, res: any) {
  res.status(status).json({
    jsonrpc: '2.0',
    error: {
      code: code,
      message: message,
    },
    id: req?.body?.id,
  });
}

export function handleError400(req: any, res: any) {
    handleError(
      {
        status: 400, 
        code: -32000, 
        message: 'Bad Request: No valid session ID provided'
      }, 
      req, 
      res
    );
}

export function handleError500({code = -32603, message = 'Bad Request: No valid session ID provided'}, req: any, res: any) {
    handleError(
      {
        status: 500, 
        code: code, 
        message: message
      }, 
      req, 
      res
    );
}

export function handleApiError (error: any) {
    console.error("API Error:", error);
    const errorMessage = error.message || "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  };