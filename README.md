# FireKey MCP Server

MCP server for [FireKey](https://firekey.ai) browser profile management. Allows AI tools like Claude Desktop, Cursor, and Claude Code to manage browser profiles through natural language.

The server exposes 15 tools through stdio and connects to FireKey's authenticated localhost API. It manages browser profiles and returns automation connection information; it does not itself read web pages or click page elements. FireKey's desktop app also communicates with its backend, so a local MCP connection does not mean the product is fully offline.

## Prerequisites

- [FireKey](https://firekey.ai) desktop app running with **Local API enabled** (Settings → Local API & MCP)
- Node.js 18+

## Quick Start

```bash
npx firekey-mcp --api-key YOUR_API_KEY
```

## Configuration

### Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firekey": {
      "command": "npx",
      "args": ["-y", "firekey-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

### Claude Code

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "firekey": {
      "command": "npx",
      "args": ["-y", "firekey-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

### Cursor

Add to MCP settings:

```json
{
  "mcpServers": {
    "firekey": {
      "command": "npx",
      "args": ["-y", "firekey-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

## Options

| Option | Env Variable | Description | Default |
|--------|-------------|-------------|---------|
| `--port` | `FIREKEY_PORT` | FireKey Local API port | Auto-detect |
| `--api-key` | `FIREKEY_API_KEY` | API key for authentication | — |

Port is auto-discovered from FireKey's data directory. Manual override only needed if running multiple instances.

To avoid putting the key in command-line arguments, you can use the supported `FIREKEY_API_KEY` environment variable in your MCP client's local configuration:

```json
{
  "mcpServers": {
    "firekey": {
      "command": "npx",
      "args": ["-y", "firekey-mcp"],
      "env": {
        "FIREKEY_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Keep configurations containing a real key private. Never commit them or include keys, cookies, proxy credentials, or live automation endpoints in public logs or screenshots. Tools such as profile deletion, cache clearing, and cookie reading should only be invoked for an explicitly authorized target.

## Verified lifecycle

A programmatic MCP client test on September 9, 2026 successfully created a blank profile with no proxy, started it in headless mode, received Puppeteer/Selenium connection information, verified its running state, stopped it, and verified it was no longer running. The desktop UI also showed the demo profile as stopped. This test did not cover long-term session persistence or a Claude/Cursor conversation.

## Available Tools

### Browser Management
- **browser_start** — Start a browser profile, returns WebSocket endpoints for Puppeteer/Selenium
- **browser_stop** — Stop a running browser
- **browser_active** — List currently running browsers

### Profile Management
- **profile_list** — List profiles with filtering and pagination
- **profile_create** — Create a new profile with fingerprint/proxy settings
- **profile_update** — Update profile settings
- **profile_delete** — Delete profiles (soft delete)
- **profile_move** — Move profiles to a group
- **profile_delete_cache** — Clear profile cache (cookies, history, etc.)
- **profile_cookies** — Get cookies from a profile

### Group Management
- **group_list** — List profile groups
- **group_create** — Create a new group
- **group_update** — Update a group

### Proxy Management
- **proxy_list** — List saved proxies
- **proxy_create** — Create a new proxy

## Example Usage

Once configured, you can use natural language in Claude:

- "List all my browser profiles"
- "Create a Windows profile with Chrome 143 and random fingerprint"
- "Start the first profile and give me the Puppeteer WebSocket URL"
- "Stop all running browsers"
- "Create a group called 'QA' and move the profile named 'QA-Demo' into it, using its returned public ID"

## Development

```bash
cd mcp-server
npm install
npm run build
node dist/index.js --api-key YOUR_KEY
```
