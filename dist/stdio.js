"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStdioMcpServer = startStdioMcpServer;
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const server_1 = require("./server");
async function startStdioMcpServer() {
    const server = (0, server_1.createServer)();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.debug("Code Runner MCP Server running on stdio");
}
