import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { WathqClient } from "./client.js";
import { registerTools } from "./tools/register.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new WathqClient(config);

  const server = new McpServer({
    name: "saudi-mcp-wathq",
    version: "0.1.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr is safe for logs; stdout is reserved for the MCP protocol.
  console.error(
    `saudi-mcp-wathq ready${config.mock ? " (MOCK mode)" : ""}.`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
