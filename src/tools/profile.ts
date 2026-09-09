/**
 * Profile management MCP tools
 * Maps to: /api/v1/browser-profile/list|create|update|delete|move|delete-cache|cookies
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FireKeyClient } from '../client.js';

export function registerProfileTools(server: McpServer, client: FireKeyClient) {
  // ── profile_list ──────────────────────────────────────────────
  server.tool(
    'profile_list',
    'List browser profiles with pagination and filtering.',
    {
      group_id: z.string().optional().describe('Filter by group ID'),
      profile_id: z
        .array(z.string())
        .optional()
        .describe('Filter by specific profile IDs'),
      profile_no: z
        .array(z.string())
        .optional()
        .describe('Filter by serial numbers'),
      sort_type: z
        .enum(['profile_no', 'last_open_time', 'created_time'])
        .optional()
        .describe('Sort field (default: profile_no)'),
      sort_order: z
        .enum(['asc', 'desc'])
        .optional()
        .describe('Sort order (default: desc)'),
      page: z.string().optional().describe('Page number (default: 1)'),
      limit: z
        .string()
        .optional()
        .describe('Items per page, max 100 (default: 50)'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/list',
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

  // ── profile_create ────────────────────────────────────────────
  server.tool(
    'profile_create',
    'Create a new browser profile with fingerprint and proxy settings.',
    {
      group_id: z
        .string()
        .describe('Group ID to assign the profile to (required)'),
      name: z.string().optional().describe('Profile name'),
      os: z
        .enum(['win', 'macArm', 'macIntel', 'android'])
        .optional()
        .describe(
          'Operating system (default: win). Aliases: windows→win, mac→macIntel'
        ),
      processor: z
        .enum(['M1', 'M2', 'M3', 'M4'])
        .optional()
        .describe('Mac processor (only for macArm)'),
      // Proxy
      proxy_method: z
        .enum(['none', 'your', 'saved'])
        .optional()
        .describe(
          'Proxy method: none=no proxy (default), your=custom proxy, saved=use saved proxy'
        ),
      proxy_type: z
        .enum(['http', 'https', 'socks5'])
        .optional()
        .describe('Proxy type'),
      proxy_host: z.string().optional().describe('Proxy host'),
      proxy_port: z.string().optional().describe('Proxy port'),
      proxy_user: z.string().optional().describe('Proxy username'),
      proxy_pass: z.string().optional().describe('Proxy password'),
      proxy_saved_id: z
        .string()
        .optional()
        .describe('Saved proxy ID (when proxy_method=saved)'),
      // Browser
      chrome_version: z
        .string()
        .optional()
        .describe('Chrome major version (e.g. 143, 142, 141)'),
      user_agent: z
        .string()
        .optional()
        .describe('Custom User-Agent (auto-generated if empty)'),
      screen_resolution: z
        .string()
        .optional()
        .describe('Screen resolution (e.g. 1920x1080)'),
      cpu_threads: z
        .number()
        .optional()
        .describe('CPU threads: 2,4,6,8,12,16 (default: 8)'),
      ram: z
        .number()
        .optional()
        .describe('RAM in GB: 2,4,8,16,32 (default: 8)'),
      // Fingerprint
      canvas_mode: z
        .enum(['off', 'noise'])
        .optional()
        .describe('Canvas fingerprint (default: noise)'),
      webgl_image_mode: z
        .enum(['off', 'noise'])
        .optional()
        .describe('WebGL image (default: noise)'),
      webgl_meta_mode: z
        .enum(['off', 'mask'])
        .optional()
        .describe('WebGL metadata (default: mask)'),
      audio_context_mode: z
        .enum(['off', 'noise'])
        .optional()
        .describe('AudioContext (default: noise)'),
      webrtc_mode: z
        .enum(['auto', 'off', 'real', 'replace'])
        .optional()
        .describe('WebRTC mode (default: auto)'),
      // Timezone & Language
      timezone_mode: z
        .enum(['auto', 'manual'])
        .optional()
        .describe('Timezone mode (default: auto)'),
      timezone: z
        .string()
        .optional()
        .describe('Timezone (when timezone_mode=manual)'),
      language_mode: z
        .enum(['auto', 'manual'])
        .optional()
        .describe('Language mode (default: auto)'),
      languages: z
        .string()
        .optional()
        .describe('Languages (when language_mode=manual)'),
      geolocation_mode: z
        .enum(['prompt', 'allow', 'block'])
        .optional()
        .describe('Geolocation (default: prompt)'),
      // Browser behavior
      start_url: z.string().optional().describe('URL to open on browser start'),
      launch_args: z
        .string()
        .optional()
        .describe('Extra Chrome launch arguments'),
      cookies: z
        .string()
        .optional()
        .describe('Cookies to import (JSON string)'),
      bookmarks: z.string().optional().describe('Bookmarks to import'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/create',
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

  // ── profile_update ────────────────────────────────────────────
  server.tool(
    'profile_update',
    'Update an existing browser profile.',
    {
      profile_id: z.string().describe('Profile ID to update (required)'),
      name: z.string().optional().describe('New profile name'),
      remark: z.string().optional().describe('Profile notes/remark'),
      user_proxy_config: z
        .object({
          proxy_type: z.string().optional(),
          proxy_host: z.string().optional(),
          proxy_port: z.string().optional(),
          proxy_user: z.string().optional(),
          proxy_password: z.string().optional(),
        })
        .optional()
        .describe('Proxy configuration'),
      fingerprint_config: z
        .record(z.unknown())
        .optional()
        .describe('Fingerprint configuration'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/update',
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

  // ── profile_delete ────────────────────────────────────────────
  server.tool(
    'profile_delete',
    'Delete browser profiles (soft delete to trash).',
    {
      profile_id: z
        .array(z.string())
        .min(1)
        .max(100)
        .describe('Array of profile IDs to delete (max 100)'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/delete',
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

  // ── profile_move ──────────────────────────────────────────────
  server.tool(
    'profile_move',
    'Move profiles to a different group.',
    {
      profile_id: z
        .array(z.string())
        .min(1)
        .describe('Array of profile IDs to move'),
      group_id: z.string().describe('Target group ID ("0" for ungrouped)'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/move',
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

  // ── profile_delete_cache ──────────────────────────────────────
  server.tool(
    'profile_delete_cache',
    'Delete cached data for browser profiles (cookies, history, localStorage, etc.).',
    {
      profile_id: z.array(z.string()).min(1).describe('Array of profile IDs'),
      type: z
        .array(
          z.enum([
            'cookie',
            'history',
            'local_storage',
            'indexeddb',
            'extension_cache',
            'image_file',
          ])
        )
        .min(1)
        .describe('Cache types to delete'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/delete-cache',
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

  // ── profile_cookies ───────────────────────────────────────────
  server.tool(
    'profile_cookies',
    'Get cookies from a browser profile (from running browser via CDP, or from local files).',
    {
      profile_id: z.string().describe('Profile ID to get cookies from'),
    },
    async (params) => {
      try {
        const data = await client.post(
          '/api/v1/browser-profile/cookies',
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
