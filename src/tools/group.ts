/**
 * Group management MCP tools
 * Maps to: /api/v1/group/list|create|update
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FireKeyClient } from '../client.js';

export function registerGroupTools(server: McpServer, client: FireKeyClient) {
  server.tool(
    'group_list',
    'List profile groups with optional name search.',
    {
      group_name: z.string().optional().describe('Search by group name'),
      page: z.string().optional().describe('Page number (default: 1)'),
      page_size: z
        .string()
        .optional()
        .describe('Items per page, max 2000 (default: 10)'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.group_name) queryParams.group_name = params.group_name;
        if (params.page) queryParams.page = params.page;
        if (params.page_size) queryParams.page_size = params.page_size;
        const data = await client.get('/api/v1/group/list', queryParams);
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
    'group_create',
    'Create a new profile group.',
    {
      group_name: z.string().describe('Name for the new group'),
      remark: z.string().optional().describe('Group description'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/group/create',
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
    'group_update',
    'Update an existing group.',
    {
      group_id: z.string().describe('Group ID to update'),
      group_name: z.string().optional().describe('New group name'),
      remark: z.string().optional().describe('New group description'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/group/update',
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
