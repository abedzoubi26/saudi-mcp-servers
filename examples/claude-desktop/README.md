# Using the Wathq server with Claude Desktop

1. Get a Wathq API key from https://developer.wathq.sa (a 30-day free app works for sandbox).
2. Open your Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
3. Merge in the `mcpServers` block from `claude_desktop_config.json` here, with your key.
4. Restart Claude Desktop.
5. Ask: "Look up the Saudi commercial registration 4030010781 and tell me its status."

To try without a key, replace the `env` block with `{ "WATHQ_MOCK": "true" }`.
