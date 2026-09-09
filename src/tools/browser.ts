/**
 * Browser management MCP tools
 * Maps to: /api/v1/browser-profile/start|stop|active
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FireKeyClient } from '../client.js';

export function registerBrowserTools(server: McpServer, client: FireKeyClient) {
  server.tool(
    'browser_start',
    'Start a browser profile. Returns WebSocket endpoints for Puppeteer/Selenium automation.',
    {
      profile_id: z
        .string()
        .optional()
        .describe('Profile public ID (use this or profile_no)'),
      profile_no: z
        .string()
        .optional()
        .describe('Profile serial number (alternative to profile_id)'),
      launch_args: z
        .array(z.string())
        .optional()
        .describe('Extra Chrome launch arguments'),
      headless: z
        .enum(['0', '1'])
        .optional()
        .describe('Headless mode: 0=visible (default), 1=headless'),
      last_opened_tabs: z
        .enum(['0', '1'])
        .optional()
        .describe('Restore last tabs: 0=no, 1=yes (default)'),
      proxy_detection: z
        .enum(['0', '1'])
        .optional()
        .describe('Show proxy detection page: 0=skip, 1=show (default)'),
      cdp_mask: z
        .enum(['0', '1'])
        .optional()
        .describe('CDP masking: 0=off, 1=on (default)'),
      delete_cache: z
        .enum(['0', '1'])
        .optional()
        .describe('Clear cache on close: 0=no (default), 1=yes'),
    },
    async (params) => {
      try {
        const data = await client.postSlow(
          '/api/v1/browser-profile/start',
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
    'browser_stop',
    'Stop a running browser profile.',
    {
      profile_id: z.string().optional().describe('Profile public ID'),
      profile_no: z.string().optional().describe('Profile serial number'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/stop',
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
    'browser_active',
    'List currently running browser profiles with their WebSocket endpoints.',
    {
      profile_id: z
        .string()
        .optional()
        .describe('Filter by specific profile ID'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.profile_id) queryParams.profile_id = params.profile_id;
        const data = await client.get(
          '/api/v1/browser-profile/active',
          queryParams
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
