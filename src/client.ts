/**
 * HTTP client for FireKey Local API
 * Uses Node.js built-in http module for maximum compatibility (Node 16+)
 */

import http from 'node:http';

export class FireKeyClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async get(path: string, params?: Record<string, string>): Promise<unknown> {
    let fullPath = path;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      fullPath += `?${searchParams.toString()}`;
    }
    return this.request('GET', fullPath);
  }

  async post(path: string, body?: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', path, body ? JSON.stringify(body) : undefined);
  }

  /**
   * POST with extended timeout (for browser_start which can be slow)
   */
  async postSlow(
    path: string,
    body?: Record<string, unknown>
  ): Promise<unknown> {
    return this.request(
      'POST',
      path,
      body ? JSON.stringify(body) : undefined,
      120000
    );
  }

  private request(
    method: string,
    path: string,
    body?: string,
    timeoutMs: number = 30000
  ): Promise<unknown> {
    const url = new URL(path, this.baseUrl);

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers: this.getHeaders(),
          timeout: timeoutMs,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });
          res.on('end', () => {
            if (res.statusCode === 401) {
              reject(
                new Error(
                  'Invalid API Key. Check your --api-key argument or FIREKEY_API_KEY environment variable.'
                )
              );
              return;
            }

            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
              return;
            }

            try {
              const parsed = JSON.parse(data) as {
                code: number;
                data: unknown;
                msg: string;
              };

              if (parsed.code !== 0) {
                reject(new Error(parsed.msg || 'Unknown error from FireKey API'));
                return;
              }

              resolve(parsed.data);
            } catch {
              reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
            }
          });
        }
      );

      req.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ECONNREFUSED') {
          reject(
            new Error(
              'FireKey is not running or Local API is not enabled. Please start FireKey and enable Local API in Settings.'
            )
          );
        } else {
          reject(err);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }
}
