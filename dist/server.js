"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const api_1 = require("./api");
const tool_1 = require("./tool");
function createServer() {
    const server = new mcp_js_1.McpServer({
        name: "test-mcp-server-js",
        version: "1.0.0",
        description: "用于查询天气的MCP服务器",
    });
    server.tool("query_weather_by_city", "按城市查询天气", {
        city: zod_1.z.string().describe("城市名称为中文拼音，如Beijing, Shanghai"),
    }, async ({ city }) => {
        try {
            const data = await (0, api_1.getWeather)(city);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2),
                    },
                ],
            };
        }
        catch (e) {
            return (0, tool_1.handleApiError)(e);
        }
    });
    server.tool("add", "两个数相加", { a: zod_1.z.number(), b: zod_1.z.number() }, async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }],
    }));
    return server;
}
