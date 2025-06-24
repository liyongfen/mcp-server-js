"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSseMcpServer = startSseMcpServer;
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
async function startSseMcpServer(port) {
    console.error("Starting SSE Server...");
    const app = (0, express_1.default)();
    const { server } = (0, server_1.createServer)();
    let transport;
    // 推送消息
    app.get("/sse", async (req, res) => {
        console.log("Received connection");
        transport = new sse_js_1.SSEServerTransport("/message", res);
        await server.connect(transport);
        server.onclose = async () => {
            await server.close();
        };
    });
    // 接收消息
    app.post("/message", async (req, res) => {
        console.log("Received message", req.body);
        await transport.handlePostMessage(req, res);
    });
    return new Promise((resolve, reject) => {
        const PORT = Number(port || 3001);
        const appServer = app.listen(PORT, (error) => {
            if (error) {
                console.error("SSE Server failed to start server:", error);
                reject(error);
                return;
            }
            const endpoint = {
                url: `http://localhost:${PORT}/sse`,
                port: PORT,
            };
            console.log(`SSE Server listening at ${endpoint.url}`);
            resolve(endpoint);
        });
        appServer.on("error", (error) => {
            console.error("SSE Server error:", error);
            reject(error);
        });
    });
}
