"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStreamableHttpMcpServer = startStreamableHttpMcpServer;
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const inMemoryEventStore_js_1 = require("@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js");
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const tool_1 = require("./tool");
const server_1 = require("./server");
async function startStreamableHttpMcpServer(port) {
    console.log("Starting Streamable HTTP server...");
    const { server } = (0, server_1.createServer)();
    const transports = {};
    const app = (0, express_1.default)();
    app.post("/mcp", async (req, res) => {
        console.log("Received MCP POST request");
        try {
            const sessionId = req.headers["mcp-session-id"];
            let transport;
            if (sessionId && transports[sessionId]) {
                transport = transports[sessionId];
                await transport.handleRequest(req, res);
                return;
            }
            else if (!sessionId) {
                const eventStore = new inMemoryEventStore_js_1.InMemoryEventStore();
                transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                    sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
                    eventStore,
                    onsessioninitialized: (sessionId) => {
                        console.log(`Session initialized with ID: ${sessionId}`);
                        transports[sessionId] = transport;
                    },
                });
                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid]) {
                        console.log(`Transport closed for session ${sid}, removing from transports map`);
                        delete transports[sid];
                    }
                };
                await server.connect(transport);
                await transport.handleRequest(req, res);
                return;
            }
            else {
                (0, tool_1.handleError400)(req, res);
                return;
            }
        }
        catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                (0, tool_1.handleError500)({ message: "Internal server error" }, req, res);
                return;
            }
        }
    });
    app.get("/mcp", async (req, res) => {
        console.log("Received MCP GET request");
        const sessionId = req.headers["mcp-session-id"];
        if (!sessionId || !transports[sessionId]) {
            (0, tool_1.handleError400)(req, res);
            return;
        }
        const lastEventId = req.headers["last-event-id"];
        if (lastEventId) {
            console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
        }
        else {
            console.log(`Establishing new SSE stream for session ${sessionId}`);
        }
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    });
    // Handle DELETE requests for session termination (according to MCP spec)
    app.delete("/mcp", async (req, res) => {
        console.log("Received MCP DELETE request");
        const sessionId = req.headers["mcp-session-id"];
        if (!sessionId || !transports[sessionId]) {
            (0, tool_1.handleError400)(req, res);
            return;
        }
        console.log(`Received session termination request for session ${sessionId}`);
        try {
            const transport = transports[sessionId];
            await transport.handleRequest(req, res);
        }
        catch (error) {
            console.error("Error handling session termination:", error);
            if (!res.headersSent) {
                (0, tool_1.handleError500)({ message: "Error handling session termination" }, req, res);
                return;
            }
        }
    });
    // Start the server
    return new Promise((resolve, reject) => {
        const PORT = Number(port || 3001);
        const appServer = app.listen(PORT, (error) => {
            if (error) {
                console.error("Streamable HTTP failed to start server:", error);
                reject(error);
                return;
            }
            const endpoint = {
                url: `http://localhost:${PORT}/mcp`,
                port: PORT,
            };
            console.log(`Streamable HTTP Server listening at ${endpoint.url}`);
            resolve(endpoint);
        });
        appServer.on("error", (error) => {
            console.error("Streamable HTTP Server error:", error);
            reject(error);
        });
    });
}
