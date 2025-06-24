import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { handleError400, handleError500 } from "./tool";
import { createServer } from "./server";

export interface McpServerEndpoint {
  url: string;
  port: number;
}

export async function startStreamableHttpMcpServer(
  port?: number
): Promise<McpServerEndpoint> {
  console.log("Starting Streamable HTTP server...");
  const { server } = createServer();
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
  const app = express();

  app.post("/mcp", async (req: Request, res: Response) => {
    console.log("Received MCP POST request");
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
        await transport.handleRequest(req, res);
        return;
      } else if (!sessionId) {
        const eventStore = new InMemoryEventStore();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
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
      } else {
        handleError400(req, res);
        return;
      }
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        handleError500({ message: "Internal server error" }, req, res);
        return;
      }
    }
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    console.log("Received MCP GET request");
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      handleError400(req, res);
      return;
    }

    const lastEventId = req.headers["last-event-id"];
    if (lastEventId) {
      console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else {
      console.log(`Establishing new SSE stream for session ${sessionId}`);
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination (according to MCP spec)
  app.delete("/mcp", async (req: Request, res: Response) => {
    console.log("Received MCP DELETE request");
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      handleError400(req, res);
      return;
    }
    
    console.log(`Received session termination request for session ${sessionId}`);
    try {
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling session termination:", error);
      if (!res.headersSent) {
        handleError500({ message: "Error handling session termination" }, req, res);
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
      const endpoint: McpServerEndpoint = {
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
