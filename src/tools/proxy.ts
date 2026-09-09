/**
 * Proxy management MCP tools
 * Maps to: /api/v1/proxy-list/list|create
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FireKeyClient } from '../client.js';

export function registerProxyTools(server: McpServer, client: FireKeyClient) {
  server.tool(
    'proxy_list',
    'List saved proxy configurations.',
    {
      proxy_id: z
        .array(z.string())
        .optional()
        .describe('Filter by specific proxy IDs (max 100)'),
      page: z.string().optional().describe('Page number (default: 1)'),
      limit: z
        .string()
        .optional()
        .describe('Items per page, max 200 (default: 50)'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/proxy-list/list',
          params as Record<string, unknown>
        );
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [{ type: 'text' as const, text: (error as Error).message }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'proxy_create',
    'Create a new proxy configuration.',
    {
      type: z.enum(['http', 'https', 'socks5', 'ssh']).describe('Proxy type'),
      host: z.string().describe('Proxy host'),
      port: z.string().describe('Proxy port (0-65536)'),
      user: z.string().optional().describe('Proxy username'),
      password: z.string().optional().describe('Proxy password'),
      proxy_url: z.string().optional().describe('Proxy refresh/change IP URL'),
      remark: z.string().optional().describe('Proxy name/description'),
      ipchecker: z
        .enum(['ip2location', 'ipapi', 'ipfoxy', 'ipidea'])
        .optional()
        .describe('IP checker service'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/proxy-list/create',
          params as Record<string, unknown>
        );
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify(data, null, 2) },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [{ type: 'text' as const, text: (error as Error).message }],
          isError: true,
        };
      }
    }
  );
}
