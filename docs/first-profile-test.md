# Create and start your first FireKey profile

For developers connecting an MCP client to a browser workflow, the first milestone should be one new profile that starts and stops predictably. Test the lifecycle before adding real logins, extensions, proxies, or production tasks.

We maintain FireKey and this MCP server. The MCP tools manage browser profiles; a separate automation library performs page interactions.

## Set up the connection

Install [FireKey](https://www.firekey.ai/?utm_source=github&utm_medium=organic&utm_campaign=first_profile_20261014&utm_content=quickstart), open the desktop app, and enable Local API in Settings > Local API & MCP. Use Node.js 18 or later and configure your MCP client as below. Replace the placeholder only in your private local configuration.

```json
{
  "mcpServers": {
    "firekey": {
      "command": "npx",
      "args": ["-y", "firekey-mcp@0.1.3"],
      "env": {
        "FIREKEY_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

This configuration stores the key in a local file. Keep that file out of version control and shared screenshots. Never publish keys, cookies, proxy passwords, or live connection endpoints.

## Run an explicit lifecycle test

Ask your MCP client to perform these steps in order, inspecting each tool result before continuing:

1. Use `group_create` with `group_name` set to `QA-First-Run`. Save the returned group ID locally.
2. Use `profile_create` with that `group_id`, `name` set to `QA-First-Run-Demo`, and `proxy_method` set to `none`. Save the returned profile public ID locally. Do not reuse an existing production profile.
3. Use `profile_list`, filtering `profile_id` to an array containing only that public ID. Confirm the returned profile name matches your new demo.
4. Use `browser_start` with the verified `profile_id`, `headless` set to `"0"`, and `last_opened_tabs` set to `"0"`. Confirm the tool succeeds and supplies connection information. Keep that information private.
5. Use `browser_active` filtered to the same `profile_id`. Confirm that exact demo is running.
6. Use `browser_stop` with that `profile_id`, then repeat the filtered active check. Confirm the demo is no longer running. Leave the stopped profile available for inspection; this test does not require deleting it.

Stop if the identity differs, a tool returns an error, or a result is ambiguous. Do not let an agent guess a replacement profile or repeat a timed-out create/start operation until its state has been checked.

## Interpret the result

| Observation | Meaning and next action |
| --- | --- |
| The intended profile starts, is active, then stops | The lifecycle test passed in your environment. Next, test a harmless page with your chosen automation library. |
| Authentication error | Check the private local key and that Local API is enabled. Do not post the key for troubleshooting. |
| Connection refused | Check that FireKey is running and that port discovery or your configured port matches the app. |
| Start times out | Inspect the same demo in FireKey and query its active state before retrying. |
| Browser starts but page automation fails | Record this as a separate connection/page-operation failure, not a lifecycle success for the whole workflow. |

On September 9, 2026, our programmatic MCP client test passed blank-profile creation, headless startup, active-state checks, and stopping. It did not validate this walkthrough in every MCP client, arbitrary websites, account signup, or long-term session persistence.

## Get help with the failing step

Open an [issue](https://github.com/partnerhbhl/firekey-mcp/issues/new) with your OS, FireKey version, MCP client, failing tool name, and a redacted error. Explain whether the demo appeared running after a timeout. Do not include account identifiers, credentials, cookies, or connection endpoints.

Your first successful lifecycle test is the starting point for evaluating FireKey, not a guarantee that a production site or workflow will work.
