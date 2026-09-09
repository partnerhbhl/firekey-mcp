/**
 * Configuration management for FireKey MCP Server
 * Priority: CLI args > env vars > port file auto-discovery > defaults
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_PORT = 50000;

export interface Config {
  baseUrl: string;
  apiKey?: string;
}

function parseArgs(): { port?: number; apiKey?: string } {
  const args = process.argv.slice(2);
  let port: number | undefined;
  let apiKey: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--api-key' && args[i + 1]) {
      apiKey = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      console.error(`
firekey-mcp - MCP server for FireKey browser profile management

Usage: firekey-mcp [options]

Options:
  --port <number>      FireKey Local API port (default: auto-detect, fallback ${DEFAULT_PORT})
  --api-key <string>   API key for authentication
  --help               Show this help
`);
      process.exit(0);
    }
  }

  return { port, apiKey };
}

/**
 * Auto-discover the Local API port from Electron's port file.
 * File location: {userData}/local_api
 * File content: http://127.0.0.1:{port}/
 */
function discoverPort(): number | null {
  const userDataDir =
    process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support', 'FireKey')
      : process.platform === 'win32'
        ? path.join(process.env.APPDATA || '', 'FireKey')
        : path.join(os.homedir(), '.config', 'FireKey');

  const portFile = path.join(userDataDir, 'local_api');

  try {
    if (fs.existsSync(portFile)) {
      const content = fs.readFileSync(portFile, 'utf-8').trim();
      const url = new URL(content);
      const port = parseInt(url.port, 10);
      if (port > 0 && port <= 65535) {
        console.error(
          `[firekey-mcp] Auto-discovered port ${port} from ${portFile}`
        );
        return port;
      }
    }
  } catch {
    // Ignore errors - fall through to default
  }

  return null;
}

export function loadConfig(): Config {
  const cliArgs = parseArgs();

  // Port: CLI > env > auto-discover > default
  const port =
    cliArgs.port ||
    (process.env.FIREKEY_PORT
      ? parseInt(process.env.FIREKEY_PORT, 10)
      : undefined) ||
    discoverPort() ||
    DEFAULT_PORT;

  // API key: CLI > env
  const apiKey = cliArgs.apiKey || process.env.FIREKEY_API_KEY || undefined;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    apiKey,
  };
}
