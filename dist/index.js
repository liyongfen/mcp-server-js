"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const stdio_1 = require("./stdio");
const streamableHttp_1 = require("./streamableHttp");
const sse_1 = require("./sse");
async function main(transport, options) {
    if (transport === 'stdio') {
        return (0, stdio_1.startStdioMcpServer)();
    }
    else if (transport === 'sse') {
        return (0, sse_1.startSseMcpServer)(options === null || options === void 0 ? void 0 : options.port);
    }
    else if (transport === 'http') {
        return (0, streamableHttp_1.startStreamableHttpMcpServer)(options === null || options === void 0 ? void 0 : options.port);
    }
    else {
        throw new Error('Invalid transport. Must be either "stdio" or "http"');
    }
}
main('stdio', {}).catch(console.error);
