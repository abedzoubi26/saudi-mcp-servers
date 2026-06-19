# @saudi-mcp/wathq

MCP server for the [Wathq](https://developer.wathq.sa) Commercial Registration API (Saudi Arabia).

Lets AI agents look up Saudi commercial registrations — verify a company before signing a contract, check status, owners, managers, capital, and branches — using official Ministry of Commerce data via Wathq.

## Install

```bash
npx @saudi-mcp/wathq
```

## Configuration

| Env var | Required | Description |
|---|---|---|
| `WATHQ_API_KEY` | yes* | Your Wathq API key (`apiKey` header). |
| `WATHQ_BASE_URL` | no | Defaults to the sandbox commercial-registration base URL. |
| `WATHQ_MOCK` | no | `true` serves canned data, no key/network needed. |

\* Not required when `WATHQ_MOCK=true`.

## Tools

See the [root README](../../README.md#wathq-tools) for the full tool table. All tools take an optional `language` argument (`ar` default / `en`).

## Notes

- IDs must be 10 digits (CR number or unified national number; the 700-series national number also returns suspended records). Arabic-Indic digits are accepted and converted automatically.
- Arabic values are returned verbatim.
- This package is the open-source connector; live use requires your own Wathq subscription.

## License

MIT
