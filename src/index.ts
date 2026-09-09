#!/usr/bin/env node

/**
 * FireKey MCP Server
 * Provides MCP tools for managing FireKey browser profiles via Local API.
 *
 * Usage:
 *   npx firekey-mcp --api-key YOUR_KEY
 *   npx firekey-mcp --port 50000 --api-key YOUR_KEY
 */


// Check Node.js version — warn but don't block (works on Node 16+ with built-in http)
const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
if (nodeVersion < 16) {
  console.error(`[firekey-mcp] Error: Node.js 16+ is required, but you are running Node.js ${process.versions.node}`);
  console.error('[firekey-mcp] Please upgrade Node.js: https://nodejs.org');
  process.exit(1);
} else if (nodeVersion < 18) {
  console.error(`[firekey-mcp] Warning: Node.js ${process.versions.node} detected. Recommended: Node.js 18+`);
}

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { FireKeyClient } from './client.js';
import { loadConfig } from './config.js';
import { createServer } from './server.js';

async function main() {
  const config = loadConfig();

  console.error(
    `[firekey-mcp] Connecting to FireKey Local API at ${config.baseUrl}`
  );
  if (!config.apiKey) {
    console.error(
      '[firekey-mcp] Warning: No API key provided. Use --api-key or FIREKEY_API_KEY env var.'
    );
  }

  const client = new FireKeyClient(config.baseUrl, config.apiKey);
  const server = createServer(client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[firekey-mcp] Server running on stdio');
}

main().catch((error) => {
  console.error('[firekey-mcp] Fatal error:', error);
  process.exit(1);
});
