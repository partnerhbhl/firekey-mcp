/**
 * MCP Server setup - creates the server and registers all tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FireKeyClient } from './client.js';
import { registerBrowserTools } from './tools/browser.js';
import { registerGroupTools } from './tools/group.js';
import { registerProfileTools } from './tools/profile.js';
import { registerProxyTools } from './tools/proxy.js';

export function createServer(client: FireKeyClient): McpServer {
  const server = new McpServer({
    name: 'firekey-mcp',
    version: '0.1.3',
  });

  registerBrowserTools(server, client);
  registerProfileTools(server, client);
  registerGroupTools(server, client);
  registerProxyTools(server, client);

  return server;
}
