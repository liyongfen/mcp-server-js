import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { createServer } from "./server";

export interface McpServerEndpoint {
  url: string;
  port: number;
}

export async function startSseMcpServer(
  port?: number
): Promise<McpServerEndpoint> {
  console.error("Starting SSE Server...");
  const app = express();
  const { server } = createServer();
  let transport: SSEServerTransport;

  // 推送消息
  app.get("/sse", async (req, res) => {
    console.log("Received connection");
    transport = new SSEServerTransport("/message", res);

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
      const endpoint: McpServerEndpoint = {
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
