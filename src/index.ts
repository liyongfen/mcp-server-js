import { startStdioMcpServer } from "./stdio";
import { startStreamableHttpMcpServer, McpServerEndpoint } from "./streamableHttp";
import { startSseMcpServer } from "./sse";

export type Transport = 'stdio' | 'http' | 'sse';
export interface HttpServerOptions {
  port?: number;
}

export async function main(transport: Transport, options?: HttpServerOptions): Promise<void | McpServerEndpoint> {
    if (transport === 'stdio') {
        return startStdioMcpServer();
    } else if(transport === 'sse') {
        return startSseMcpServer(options?.port);
    } else if (transport === 'http') {
        return startStreamableHttpMcpServer(options?.port);
    } else {
        throw new Error('Invalid transport. Must be either "stdio" or "http"');
    }
}

main('stdio', {}).catch(console.error);