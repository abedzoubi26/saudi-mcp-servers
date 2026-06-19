# saudi-mcp-servers

Open-source [Model Context Protocol](https://modelcontextprotocol.io) (MCP) servers for Saudi APIs and services — so AI agents can work with Saudi government and business systems natively.

> العربية: انظر [README.ar.md](./README.ar.md)

## Why

AI agents can already connect to hundreds of Western services through MCP. Almost no Saudi service has an open MCP server. This monorepo fills that gap, starting with the systems every Saudi business touches.

**Design principle:** tool names and descriptions are in English (LLM tool-calling in Arabic is still brittle), while the **data** returned stays in Arabic. Agents select tools reliably; users get authentic Arabic results.

## Servers

| Package | Service | Status |
|---|---|---|
| [`@saudi-mcp/wathq`](./packages/wathq) | Wathq — Commercial Registration (Ministry of Commerce) | ✅ v0.1 |
| `@saudi-mcp/zatca` | ZATCA — E-invoicing (Fatoora) | 🔜 planned |

## Quick start (Wathq)

```bash
npx @saudi-mcp/wathq
```

Set your Wathq API key:

```bash
export WATHQ_API_KEY="your_key_here"
```

Or try it with **no key** using canned data:

```bash
WATHQ_MOCK=true npx @saudi-mcp/wathq
```

### Use with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wathq": {
      "command": "npx",
      "args": ["-y", "@saudi-mcp/wathq"],
      "env": { "WATHQ_API_KEY": "your_key_here" }
    }
  }
}
```

See [examples/claude-desktop](./examples/claude-desktop) for more.

## Wathq tools

All accept a `language` argument (`ar` default, or `en`).

| Tool | Purpose |
|---|---|
| `wathq_get_company_info` | Basic CR data: name, status, activities, entity type |
| `wathq_get_company_full_info` | Complete record incl. capital, contact, dates |
| `wathq_get_company_status` | Current status only |
| `wathq_get_company_capital` | Capital details |
| `wathq_get_company_managers` | Managers and board of directors |
| `wathq_get_company_owners` | Owner / partners and shares |
| `wathq_get_company_branches` | Registered branches |
| `wathq_get_related_registrations` | CRs linked to a person/entity ID |
| `wathq_check_ownership` | Whether an ID owns/partners any CR |

## Note on access

The server is the open-source **connector**. To use it against live data you need your own [Wathq](https://developer.wathq.sa) subscription and API key. A 30-day free app covers the sandbox for development.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Mock mode (`WATHQ_MOCK=true`) needs no key, so contributors and CI run fully offline.

## Contributing

New servers and improvements welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
