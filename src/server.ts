import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getWeather } from "./api";
import { handleApiError } from "./tool";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "test-mcp-server-js",
    version: "1.0.0",
    description: "用于查询天气的MCP服务器",
  });

  server.tool(
    "query_weather_by_city",
    "按城市查询天气",
    {
      city: z.string().describe("城市名称为中文拼音，如Beijing, Shanghai"),
    },
    async ({ city }) => {
      try {
        const data = await getWeather(city);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (e) {
        return handleApiError(e);
      }
    }
  );

  server.tool(
    "add",
    "两个数相加",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }],
    })
  );

  return server;
}
